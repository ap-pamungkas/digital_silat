import { prisma } from "@/lib/prisma";
import { Corner, PenaltyRecord, PenaltyType, ScoringAction, ScoreEvent } from "@/lib/types";
import {
  agreedJudgeNumbers,
  buildScoreEventGroups,
  MIN_JUDGES_REQUIRED,
  SCORE_CONSENSUS_WINDOW_MS,
  scorePointsForAction,
} from "@/lib/scoring/rules";
import { penaltyPointsForType } from "@/lib/scoring/penalties";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/server/errors";

function formatMatchTime(remainingSeconds: number): string {
  return `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;
}

function remainingMatchSeconds(
  timerStatus: string,
  timerLastStartedAt: Date | null,
  timeRemainingSeconds: number,
  now: Date
): number {
  const elapsedSeconds =
    timerStatus === "RUNNING" && timerLastStartedAt
      ? Math.floor((now.getTime() - timerLastStartedAt.getTime()) / 1000)
      : 0;
  return Math.max(0, timeRemainingSeconds - elapsedSeconds);
}

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

  if (!match) throw new NotFoundError("Partai pertandingan tidak ditemukan.");

  const events: ScoreEvent[] = match.scoreEvents.map((event) => ({
    id: event.id,
    matchId: event.matchId,
    judgeId: event.judgeId,
    judgeNumber: event.judgeNumber,
    corner: event.corner,
    action: event.action,
    points: event.points,
    round: event.round,
    matchTime: event.matchTime,
    timestamp: event.createdAt.getTime(),
    verified: event.verified,
    status: event.status,
    judgesAgreed: [event.judgeNumber],
  }));

  const { groupByEventId } = buildScoreEventGroups(events);
  for (const event of events) {
    event.judgesAgreed = agreedJudgeNumbers(groupByEventId.get(event.id), [event.judgeNumber]);
  }

  const mapPenalty = (penalty: (typeof match.penalties)[number]): PenaltyRecord => ({
    id: penalty.id,
    matchId: penalty.matchId,
    corner: penalty.corner,
    type: penalty.type,
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
  const expectedPoints = scorePointsForAction(input.action);
  if (expectedPoints === undefined || input.points !== expectedPoints) {
    throw new ValidationError("Jenis serangan atau nilai poin tidak valid.");
  }
  if (!Number.isInteger(input.judgeNumber) || input.judgeNumber < 1 || input.judgeNumber > 5) {
    throw new ValidationError("Nomor juri tidak valid.");
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
    if (!match) throw new NotFoundError("Partai pertandingan tidak ditemukan.");
    if (match.status === "FINISHED" || match.status === "CANCELLED") {
      throw new ConflictError("Pertandingan tidak menerima masukan skor.");
    }

    const judge = await transaction.judge.findUnique({
      where: { arenaId_judgeNumber: { arenaId: match.arenaId, judgeNumber: input.judgeNumber } },
      select: { id: true },
    });
    if (!judge) throw new ValidationError("Juri belum terdaftar pada gelanggang pertandingan ini.");

    const now = new Date();
    const remainingSeconds = remainingMatchSeconds(
      match.timerStatus,
      match.timerLastStartedAt,
      match.timeRemainingSeconds,
      now
    );
    const matchTime = formatMatchTime(remainingSeconds);
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
    if (!target) throw new NotFoundError("Event skor tidak ditemukan.");

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
      throw new ConflictError(`Dibutuhkan minimal ${MIN_JUDGES_REQUIRED} juri untuk mengesahkan poin.`);
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
      if (!match) throw new NotFoundError("Partai pertandingan tidak ditemukan.");
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

export async function applyPenaltyAction(input: {
  matchId: string;
  corner: Corner;
  type: PenaltyType;
  refereeNote?: string;
}) {
  const pointsDeducted = penaltyPointsForType(input.type);

  const penaltyId = await prisma.$transaction(async (transaction) => {
    const match = await transaction.match.findUnique({
      where: { id: input.matchId },
      select: {
        id: true,
        status: true,
        redScore: true,
        blueScore: true,
        currentRound: true,
        timeRemainingSeconds: true,
        timerStatus: true,
        timerLastStartedAt: true,
      },
    });
    if (!match) throw new NotFoundError("Partai pertandingan tidak ditemukan.");
    if (match.status === "FINISHED" || match.status === "CANCELLED") {
      throw new ConflictError("Pertandingan tidak menerima hukuman baru.");
    }

    const now = new Date();
    const remainingSeconds = remainingMatchSeconds(
      match.timerStatus,
      match.timerLastStartedAt,
      match.timeRemainingSeconds,
      now
    );

    const penalty = await transaction.penalty.create({
      data: {
        matchId: match.id,
        corner: input.corner,
        type: input.type,
        pointsDeducted,
        round: match.currentRound,
        refereeNote: input.refereeNote || null,
        matchTime: formatMatchTime(remainingSeconds),
      },
      select: { id: true },
    });

    await transaction.match.update({
      where: { id: match.id },
      data: input.corner === "RED"
        ? { redScore: Math.max(0, match.redScore - pointsDeducted) }
        : { blueScore: Math.max(0, match.blueScore - pointsDeducted) },
    });

    await transaction.auditLog.create({
      data: {
        matchId: match.id,
        action: "PENALTY_APPLIED",
        details: JSON.stringify({
          penaltyId: penalty.id,
          corner: input.corner,
          type: input.type,
          pointsDeducted,
          round: match.currentRound,
          refereeNote: input.refereeNote || null,
        }),
      },
    });

    return penalty.id;
  });

  return {
    penaltyId,
    snapshot: await getMatchScoringSnapshot(input.matchId),
  };
}