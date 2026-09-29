import { prisma } from "@/lib/prisma";
import { Corner, PenaltyRecord, ScoringAction, ScoreEvent } from "@/lib/types";

const SCORE_CONSENSUS_WINDOW_MS = 2000;
const MIN_JUDGES_REQUIRED = 2;
const SCORE_POINTS: Partial<Record<ScoringAction, number>> = {
  PUKULAN: 1,
  TENDANGAN: 2,
  JATUHAN: 3,
  TANGKISAN_PUKULAN: 2,
  TANGKISAN_TENDANGAN: 3,
};

export async function getMatchScoringSnapshot(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      redScore: true,
      blueScore: true,
      scoreEvents: { orderBy: { createdAt: "desc" } },
      penalties: { orderBy: { timestamp: "desc" } },
    },
  });

  if (!match) throw new Error("Partai pertandingan tidak ditemukan.");

  const orderedEvents = [...match.scoreEvents].sort(
    (first, second) => first.createdAt.getTime() - second.createdAt.getTime()
  );
  const eventGroups: { key: string; firstTimestamp: number; events: typeof orderedEvents }[] = [];
  const eventGroupById = new Map<string, (typeof eventGroups)[number]>();

  for (const event of orderedEvents) {
    const key = `${event.status}:${event.round}:${event.corner}:${event.action}`;
    const timestamp = event.createdAt.getTime();
    let group = eventGroups.find((candidate) =>
      candidate.key === key && timestamp - candidate.firstTimestamp <= SCORE_CONSENSUS_WINDOW_MS
    );
    if (!group) {
      group = { key, firstTimestamp: timestamp, events: [] };
      eventGroups.push(group);
    }
    group.events.push(event);
    eventGroupById.set(event.id, group);
  }

  const events: ScoreEvent[] = match.scoreEvents.map((event) => {
    const group = eventGroupById.get(event.id);
    const judgesAgreed = group
      ? [...new Set(group.events.map((groupEvent) => groupEvent.judgeNumber))].sort()
      : [event.judgeNumber];
    return {
      id: event.id,
      matchId: event.matchId,
      judgeId: event.judgeId,
      judgeNumber: event.judgeNumber,
      corner: event.corner as Corner,
      action: event.action as ScoringAction,
      points: event.points,
      round: event.round,
      matchTime: event.matchTime,
      timestamp: event.createdAt.getTime(),
      verified: event.verified,
      status: event.status as ScoreEvent["status"],
      judgesAgreed,
    };
  });

  const mapPenalty = (penalty: (typeof match.penalties)[number]): PenaltyRecord => ({
    id: penalty.id,
    matchId: penalty.matchId,
    corner: penalty.corner as Corner,
    type: penalty.type as PenaltyRecord["type"],
    pointsDeducted: penalty.pointsDeducted,
    round: penalty.round,
    timestamp: penalty.timestamp.getTime(),
    refereeNote: penalty.refereeNote || undefined,
  });

  return {
    matchId: match.id,
    redScore: match.redScore,
    blueScore: match.blueScore,
    events,
    redPenalties: match.penalties.filter((penalty) => penalty.corner === "RED").map(mapPenalty),
    bluePenalties: match.penalties.filter((penalty) => penalty.corner === "BLUE").map(mapPenalty),
  };
}

export async function submitScoreEventAction(input: {
  matchId: string;
  corner: Corner;
  action: ScoringAction;
  points: number;
  judgeNumber: number;
}) {
  const expectedPoints = SCORE_POINTS[input.action];
  if (expectedPoints === undefined || input.points !== expectedPoints) {
    throw new Error("Jenis serangan atau nilai poin tidak valid.");
  }
  if (!Number.isInteger(input.judgeNumber) || input.judgeNumber < 1 || input.judgeNumber > 5) {
    throw new Error("Nomor juri tidak valid.");
  }

  const result = await prisma.$transaction(async (transaction) => {
    const match = await transaction.match.findUnique({
      where: { id: input.matchId },
      select: {
        id: true,
        arenaId: true,
        status: true,
        currentRound: true,
        timeRemainingSeconds: true,
        timerStatus: true,
        timerLastStartedAt: true,
      },
    });
    if (!match) throw new Error("Partai pertandingan tidak ditemukan.");
    if (match.status === "FINISHED" || match.status === "CANCELLED") {
      throw new Error("Pertandingan tidak menerima masukan skor.");
    }

    const judge = await transaction.judge.findUnique({
      where: { arenaId_judgeNumber: { arenaId: match.arenaId, judgeNumber: input.judgeNumber } },
      select: { id: true },
    });
    if (!judge) throw new Error("Juri belum terdaftar pada gelanggang pertandingan ini.");

    const now = new Date();
    const elapsedSeconds = match.timerStatus === "RUNNING" && match.timerLastStartedAt
      ? Math.floor((now.getTime() - match.timerLastStartedAt.getTime()) / 1000)
      : 0;
    const remainingSeconds = Math.max(0, match.timeRemainingSeconds - elapsedSeconds);
    const matchTime = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;
    const recentEvents = await transaction.scoreEvent.findMany({
      where: {
        matchId: match.id,
        round: match.currentRound,
        corner: input.corner,
        action: input.action,
        status: "PENDING",
        createdAt: { gte: new Date(now.getTime() - SCORE_CONSENSUS_WINDOW_MS) },
      },
      select: { judgeNumber: true },
    });
    const agreedJudges = [...new Set([...recentEvents.map((item) => item.judgeNumber), input.judgeNumber])].sort();
    if (recentEvents.some((event) => event.judgeNumber === input.judgeNumber)) {
      return { judgeNumbers: agreedJudges };
    }

    const event = await transaction.scoreEvent.create({
      data: {
        matchId: match.id,
        judgeId: judge.id,
        judgeNumber: input.judgeNumber,
        corner: input.corner,
        action: input.action,
        points: input.points,
        round: match.currentRound,
        matchTime,
        matchTimestampSeconds: remainingSeconds,
        verified: false,
        status: "PENDING",
      },
      select: { id: true },
    });
    await transaction.auditLog.create({
      data: {
        matchId: match.id,
        action: "SCORE_SUBMITTED",
        details: JSON.stringify({ eventId: event.id, judgeNumber: input.judgeNumber, corner: input.corner, points: input.points }),
      },
    });

    return { judgeNumbers: agreedJudges };
  });

  return {
    snapshot: await getMatchScoringSnapshot(input.matchId),
    agreedJudges: result.judgeNumbers,
  };
}

export async function decideScoreEventAction(input: {
  matchId: string;
  eventId: string;
  decision: "VERIFY" | "REJECT";
}) {
  await prisma.$transaction(async (transaction) => {
    const target = await transaction.scoreEvent.findFirst({
      where: { id: input.eventId, matchId: input.matchId },
    });
    if (!target) throw new Error("Event skor tidak ditemukan.");

    const peerEvents = await transaction.scoreEvent.findMany({
      where: {
        matchId: target.matchId,
        round: target.round,
        corner: target.corner,
        action: target.action,
        status: target.status,
        createdAt: {
          gte: new Date(target.createdAt.getTime() - SCORE_CONSENSUS_WINDOW_MS),
          lte: new Date(target.createdAt.getTime() + SCORE_CONSENSUS_WINDOW_MS),
        },
      },
      select: { id: true, judgeNumber: true },
    });
    const group = peerEvents.some((event) => event.id === target.id)
      ? peerEvents
      : [...peerEvents, { id: target.id, judgeNumber: target.judgeNumber }];
    const agreedJudges = [...new Set(group.map((event) => event.judgeNumber))];

    if (input.decision === "VERIFY" && target.status === "PENDING" && agreedJudges.length < MIN_JUDGES_REQUIRED) {
      throw new Error(`Dibutuhkan minimal ${MIN_JUDGES_REQUIRED} juri untuk mengesahkan poin.`);
    }

    const nextStatus = input.decision === "VERIFY" ? "VERIFIED" : "REJECTED";
    const changed = await transaction.scoreEvent.updateMany({
      where: { id: { in: group.map((event) => event.id) }, status: target.status },
      data: { status: nextStatus, verified: nextStatus === "VERIFIED" },
    });
    if (changed.count === 0) return;

    const applyPoints = input.decision === "VERIFY" && target.status !== "VERIFIED";
    const removePoints = input.decision === "REJECT" && target.status === "VERIFIED";
    if (applyPoints || removePoints) {
      const match = await transaction.match.findUnique({
        where: { id: input.matchId },
        select: { redScore: true, blueScore: true },
      });
      if (!match) throw new Error("Partai pertandingan tidak ditemukan.");
      const delta = applyPoints ? target.points : -target.points;
      await transaction.match.update({
        where: { id: input.matchId },
        data: target.corner === "RED"
          ? { redScore: Math.max(0, match.redScore + delta) }
          : { blueScore: Math.max(0, match.blueScore + delta) },
      });
    }

    await transaction.auditLog.create({
      data: {
        matchId: input.matchId,
        action: input.decision === "VERIFY" ? "SCORE_VERIFIED" : "SCORE_REJECTED",
        details: JSON.stringify({ eventId: target.id, judgeNumbers: agreedJudges, corner: target.corner, points: target.points }),
      },
    });
  });

  return getMatchScoringSnapshot(input.matchId);
}