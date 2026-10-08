import { prisma } from "@/lib/prisma";
import {
  Match,
  MatchStage,
  MatchTimerAction,
  MatchWinReason,
  PenaltyRecord,
  ScoreEvent,
} from "@/lib/types";
import { ActionResultVoid, getErrorMessage, toActionStatus } from "./shared";
import { ConflictError, NotFoundError, ValidationError, toStatus } from "@/lib/server/errors";
import { syncTournamentStatuses } from "./tournaments";

function parseScheduledDate(dateValue?: string, timeValue?: string): Date {
  if (dateValue && timeValue) {
    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
    const timeParts = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeValue);
    if (!dateParts || !timeParts) throw new ValidationError("Format tanggal atau waktu pertandingan tidak valid.");

    const scheduledDate = new Date(`${dateValue}T${timeValue}:00.000Z`);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.toISOString().slice(0, 10) !== dateValue) {
      throw new ValidationError("Tanggal pertandingan tidak valid.");
    }
    return scheduledDate;
  }

  const value = timeValue || dateValue;
  if (!value) return new Date();

  const parsedDate = new Date(value);
  if (!Number.isNaN(parsedDate.getTime())) return parsedDate;

  const timeParts = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!timeParts) throw new ValidationError("Format waktu pertandingan tidak valid.");

  const scheduledDate = new Date();
  scheduledDate.setUTCHours(Number(timeParts[1]), Number(timeParts[2]), 0, 0);
  return scheduledDate;
}

export type MatchScheduleInput = {
  arenaId: string;
  matchNumber: string;
  redAthleteId: string;
  blueAthleteId: string;
  stage: MatchStage;
  scheduledDate: string;
  scheduledTime: string;
};

export async function getMatches(): Promise<Match[]> {
  try {
    await syncTournamentStatuses().catch(() => {});
    const list = await prisma.match.findMany({
      include: {
        tournament: true,
        arena: true,
        category: true,
        redAthlete: {
          include: { contingent: true, category: true },
        },
        blueAthlete: {
          include: { contingent: true, category: true },
        },
        scoreEvents: {
          orderBy: { createdAt: "desc" },
        },
        penalties: {
          orderBy: { timestamp: "desc" },
        },
      },
      orderBy: { matchNumber: "asc" },
    });

    if (!list.length) return [];

    return list.map((match) => {
      const redPenalties: PenaltyRecord[] = match.penalties
        .filter((penalty) => penalty.corner === "RED")
        .map((penalty) => ({
          id: penalty.id,
          matchId: penalty.matchId,
          corner: "RED" as const,
          type: penalty.type,
          pointsDeducted: penalty.pointsDeducted,
          round: penalty.round,
          timestamp: penalty.timestamp.getTime(),
          refereeNote: penalty.refereeNote || undefined,
        }));

      const bluePenalties: PenaltyRecord[] = match.penalties
        .filter((penalty) => penalty.corner === "BLUE")
        .map((penalty) => ({
          id: penalty.id,
          matchId: penalty.matchId,
          corner: "BLUE" as const,
          type: penalty.type,
          pointsDeducted: penalty.pointsDeducted,
          round: penalty.round,
          timestamp: penalty.timestamp.getTime(),
          refereeNote: penalty.refereeNote || undefined,
        }));

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
      }));

      const scheduledTimeStr = match.scheduledTime
        ? `${String(match.scheduledTime.getUTCHours()).padStart(2, "0")}:${String(
            match.scheduledTime.getUTCMinutes()
          ).padStart(2, "0")} WIB`
        : "Belum ditentukan";

      return {
        id: match.id,
        matchNumber: match.matchNumber,
        arenaId: match.arena.arenaCode,
        arenaName: match.arena.name,
        tournamentId: match.tournament.code,
        tournamentName: match.tournament.name,
        category: match.category.name,
        stage: `BABAK ${match.stage.replace(/_/g, " ")}`,
        redAthlete: {
          id: match.redAthlete.id,
          name: match.redAthlete.name,
          contingent: match.redAthlete.contingent.name,
          contingentCode: match.redAthlete.contingent.code,
          gender: match.redAthlete.gender,
          weightClass: match.redAthlete.category.categoryClass,
          seed: match.redAthlete.seed || undefined,
        },
        blueAthlete: {
          id: match.blueAthlete.id,
          name: match.blueAthlete.name,
          contingent: match.blueAthlete.contingent.name,
          contingentCode: match.blueAthlete.contingent.code,
          gender: match.blueAthlete.gender,
          weightClass: match.blueAthlete.category.categoryClass,
          seed: match.blueAthlete.seed || undefined,
        },
        redScore: match.redScore,
        blueScore: match.blueScore,
        currentRound: match.currentRound,
        totalRounds: match.totalRounds,
        timeRemainingSeconds: match.timeRemainingSeconds,
        roundDurationSeconds: match.roundDurationSeconds,
        timerStatus: match.timerStatus,
        status: match.status,
        winner: match.winnerCorner || undefined,
        winReason: match.winReason ? match.winReason.replace(/_/g, " ") : undefined,
        scheduledTime: scheduledTimeStr,
        scheduledDate: match.scheduledTime?.toISOString().slice(0, 10) ?? "",
        redPenalties,
        bluePenalties,
        events,
      };
    });
  } catch (error) {
    console.error("Error in getMatches:", error);
    return [];
  }
}

export async function createMatchAction(data: {
  tournamentId?: string;
  arenaId: string;
  categoryId?: string;
  categoryName?: string;
  matchNumber: string;
  stage?: MatchStage;
  redAthleteId: string;
  blueAthleteId: string;
  scheduledDate?: string;
  scheduledTime?: string;
}) {
  try {
    const tournament = data.tournamentId
      ? await prisma.tournament.findUnique({ where: { code: data.tournamentId } })
      : await prisma.tournament.findFirst({
          where: { status: "ONGOING" },
          orderBy: { createdAt: "desc" },
        }) || (await prisma.tournament.findFirst({ orderBy: { createdAt: "desc" } }));

    if (!tournament) throw new NotFoundError("Turnamen tidak ditemukan.");

    const arena = await prisma.arena.findFirst({
      where: {
        tournamentId: tournament.id,
        arenaCode: data.arenaId,
      },
    });

    if (!arena) throw new NotFoundError("Gelanggang tidak ditemukan.");

    const [redAthlete, blueAthlete] = await Promise.all([
      prisma.athlete.findUnique({
        where: { id: data.redAthleteId },
        include: { contingent: true },
      }),
      prisma.athlete.findUnique({
        where: { id: data.blueAthleteId },
        include: { contingent: true },
      }),
    ]);

    if (!redAthlete || !blueAthlete) throw new NotFoundError("Atlet tidak ditemukan.");
    if (
      redAthlete.contingent.tournamentId !== tournament.id ||
      blueAthlete.contingent.tournamentId !== tournament.id
    ) {
      throw new ValidationError("Atlet tidak terdaftar pada turnamen ini.");
    }
    if (redAthlete.categoryId !== blueAthlete.categoryId) {
      throw new ConflictError("Kedua atlet harus berada pada kategori yang sama.");
    }
    if (data.categoryId && data.categoryId !== redAthlete.categoryId) {
      throw new ConflictError("Kategori pertandingan tidak sesuai dengan kategori atlet.");
    }

    const category = await prisma.category.findFirst({
      where: { id: redAthlete.categoryId, tournamentId: tournament.id },
    });
    if (!category) throw new NotFoundError("Kategori atlet tidak ditemukan pada turnamen ini.");

    const stageVal = data.stage || "PENYISIHAN";

    const newMatch = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        arenaId: arena.id,
        categoryId: category.id,
        matchNumber: data.matchNumber.startsWith("MATCH") ? data.matchNumber : `MATCH #${data.matchNumber}`,
        stage: stageVal,
        redAthleteId: data.redAthleteId,
        blueAthleteId: data.blueAthleteId,
        status: "SCHEDULED",
        currentRound: 1,
        totalRounds: category.roundCount,
        roundDurationSeconds: category.roundDurationSeconds,
        timeRemainingSeconds: category.roundDurationSeconds,
        timerStatus: "READY",
        scheduledTime: parseScheduledDate(data.scheduledDate, data.scheduledTime),
      },
      include: {
        arena: true,
        tournament: true,
        category: true,
        redAthlete: { include: { contingent: true, category: true } },
        blueAthlete: { include: { contingent: true, category: true } },
      },
    });

    return {
      success: true as const,
      data: newMatch,
    };
  } catch (error: unknown) {
    console.error("Failed to create match:", error);
    const status = toActionStatus(toStatus(error));
    if (status >= 500) {
      return { success: false, status: 500, error: "Gagal membuat partai pertandingan." };
    }
    return {
      success: false,
      status,
      error: getErrorMessage(error) || "Gagal membuat partai pertandingan.",
    };
  }
}

export async function updateMatchScheduleAction(
  matchId: string,
  data: MatchScheduleInput
): Promise<ActionResultVoid> {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        tournamentId: true,
        status: true,
        redScore: true,
        blueScore: true,
        scoreEvents: { select: { id: true }, take: 1 },
        penalties: { select: { id: true }, take: 1 },
      },
    });

    if (!match) {
      return { success: false, status: 404, error: "Partai pertandingan tidak ditemukan." };
    }

    if (
      match.status !== "SCHEDULED" ||
      match.redScore !== 0 ||
      match.blueScore !== 0 ||
      match.scoreEvents.length > 0 ||
      match.penalties.length > 0
    ) {
      return { success: false, status: 409, error: "Hanya partai terjadwal tanpa aktivitas yang dapat diubah." };
    }

    const matchNumber = data.matchNumber.trim();
    if (!matchNumber || !data.scheduledDate.trim() || !data.scheduledTime.trim()) {
      return { success: false, status: 400, error: "Nomor partai, tanggal, dan waktu mulai wajib diisi." };
    }
    if (data.redAthleteId === data.blueAthleteId) {
      return { success: false, status: 400, error: "Atlet sudut merah dan biru harus berbeda." };
    }

    const arena = await prisma.arena.findFirst({
      where: { tournamentId: match.tournamentId, arenaCode: data.arenaId },
      select: { id: true },
    });
    if (!arena) {
      return { success: false, status: 400, error: "Gelanggang tidak tersedia pada turnamen ini." };
    }

    const [redAthlete, blueAthlete] = await Promise.all([
      prisma.athlete.findUnique({
        where: { id: data.redAthleteId },
        include: { contingent: true },
      }),
      prisma.athlete.findUnique({
        where: { id: data.blueAthleteId },
        include: { contingent: true },
      }),
    ]);

    if (!redAthlete || !blueAthlete) {
      return { success: false, status: 400, error: "Atlet tidak ditemukan." };
    }
    if (
      redAthlete.contingent.tournamentId !== match.tournamentId ||
      blueAthlete.contingent.tournamentId !== match.tournamentId
    ) {
      return { success: false, status: 400, error: "Atlet tidak terdaftar pada turnamen ini." };
    }
    if (redAthlete.categoryId !== blueAthlete.categoryId) {
      return { success: false, status: 400, error: "Kedua atlet harus berada pada kategori yang sama." };
    }

    const category = await prisma.category.findFirst({
      where: { id: redAthlete.categoryId, tournamentId: match.tournamentId },
      select: { id: true, roundCount: true, roundDurationSeconds: true },
    });
    if (!category) {
      return { success: false, status: 400, error: "Kategori atlet tidak tersedia pada turnamen ini." };
    }

    const updated = await prisma.match.updateMany({
      where: {
        id: matchId,
        status: "SCHEDULED",
        redScore: 0,
        blueScore: 0,
        scoreEvents: { none: {} },
        penalties: { none: {} },
      },
      data: {
        matchNumber: matchNumber.startsWith("MATCH") ? matchNumber : `MATCH #${matchNumber}`,
        arenaId: arena.id,
        categoryId: category.id,
        stage: data.stage,
        redAthleteId: redAthlete.id,
        blueAthleteId: blueAthlete.id,
        scheduledTime: parseScheduledDate(data.scheduledDate, data.scheduledTime),
        currentRound: 1,
        totalRounds: category.roundCount,
        roundDurationSeconds: category.roundDurationSeconds,
        timeRemainingSeconds: category.roundDurationSeconds,
        timerStatus: "READY",
        timerLastStartedAt: null,
      },
    });

    if (updated.count === 0) {
      return { success: false, status: 409, error: "Partai sudah berubah dan tidak dapat diedit." };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update match schedule:", error);
    return { success: false, status: 500, error: "Gagal memperbarui jadwal pertandingan." };
  }
}

export async function deleteScheduledMatchAction(matchId: string): Promise<ActionResultVoid> {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true },
    });

    if (!match) {
      return { success: false, status: 404, error: "Partai pertandingan tidak ditemukan." };
    }

    const deleted = await prisma.$transaction(async (transaction) => {
      const result = await transaction.match.deleteMany({
        where: {
          id: matchId,
          status: "SCHEDULED",
          redScore: 0,
          blueScore: 0,
          scoreEvents: { none: {} },
          penalties: { none: {} },
        },
      });

      if (result.count === 0) return false;

      await transaction.arena.updateMany({
        where: { currentMatchId: matchId },
        data: { currentMatchId: null },
      });
      return true;
    });

    if (!deleted) {
      return { success: false, status: 409, error: "Hanya partai terjadwal tanpa aktivitas yang dapat dihapus." };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete scheduled match:", error);
    return { success: false, status: 500, error: "Gagal menghapus jadwal pertandingan." };
  }
}

export async function updateMatchStatusAction(data: {
  matchId: string;
  status: "SCHEDULED" | "READY" | "LIVE" | "PAUSED" | "FINISHED" | "CANCELLED";
  winnerCorner?: "RED" | "BLUE";
  winReason?: MatchWinReason;
}): Promise<ActionResultVoid> {
  try {
    await prisma.$transaction(async (transaction) => {
      const match = await transaction.match.findUnique({
        where: { id: data.matchId },
      });

      if (!match) throw new NotFoundError("Partai pertandingan tidak ditemukan.");
      if (data.status === "FINISHED" && !data.winnerCorner) {
        throw new ValidationError("Pemenang partai wajib dipilih.");
      }

      const winnerAthleteId = data.winnerCorner === "RED"
        ? match.redAthleteId
        : data.winnerCorner === "BLUE"
          ? match.blueAthleteId
          : null;

      const finishedAt = data.status === "FINISHED" ? new Date() : undefined;
      await transaction.match.update({
        where: { id: data.matchId },
        data: {
          status: data.status,
          winnerCorner: data.winnerCorner || null,
          winnerAthleteId,
          winReason: data.winReason,
          endedAt: finishedAt,
          startedAt: data.status === "LIVE" && !match.startedAt ? new Date() : undefined,
          timerStatus: data.status === "FINISHED" ? "FINISHED" : undefined,
          timeRemainingSeconds: data.status === "FINISHED" ? 0 : undefined,
          timerLastStartedAt: data.status === "FINISHED" ? null : undefined,
        },
      });

      if (finishedAt) {
        await transaction.auditLog.create({
          data: {
            matchId: data.matchId,
            action: "MATCH_ENDED",
            details: JSON.stringify({ winnerCorner: data.winnerCorner, winnerAthleteId, winReason: data.winReason }),
          },
        });
      }
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update match status:", error);
    const status = toActionStatus(toStatus(error));
    if (status >= 500) {
      return { success: false, status: 500, error: "Gagal memperbarui status pertandingan." };
    }
    return {
      success: false,
      status,
      error: getErrorMessage(error) || "Gagal memperbarui status pertandingan.",
    };
  }
}

function getRemainingSeconds(match: {
  timeRemainingSeconds: number;
  timerStatus: string;
  timerLastStartedAt: Date | null;
}, now: Date): number {
  if (match.timerStatus !== "RUNNING" || !match.timerLastStartedAt) {
    return match.timeRemainingSeconds;
  }

  const elapsedSeconds = Math.floor((now.getTime() - match.timerLastStartedAt.getTime()) / 1000);
  return Math.max(0, match.timeRemainingSeconds - elapsedSeconds);
}

export async function getMatchTimerAction(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      status: true,
      currentRound: true,
      timeRemainingSeconds: true,
      timerStatus: true,
      timerLastStartedAt: true,
    },
  });

  if (!match) throw new NotFoundError("Partai pertandingan tidak ditemukan.");

  const timeRemainingSeconds = getRemainingSeconds(match, new Date());
  let timerStatus = match.timerStatus;
  if (timerStatus === "RUNNING" && timeRemainingSeconds === 0) {
    const expired = await prisma.match.updateMany({
      where: {
        id: match.id,
        timerStatus: "RUNNING",
        timerLastStartedAt: match.timerLastStartedAt,
      },
      data: {
        timeRemainingSeconds: 0,
        timerStatus: "FINISHED",
        timerLastStartedAt: null,
      },
    });
    if (expired.count === 0) return getMatchTimerAction(matchId);
    timerStatus = "FINISHED";
  }

  return {
    matchId: match.id,
    currentRound: match.currentRound,
    timeRemainingSeconds,
    timerStatus,
    status: match.status,
  };
}

export async function updateMatchTimerAction(input: {
  matchId: string;
  action: MatchTimerAction;
  round?: number;
}) {
  const match = await prisma.match.findUnique({
    where: { id: input.matchId },
    select: {
      id: true,
      status: true,
      currentRound: true,
      totalRounds: true,
      roundDurationSeconds: true,
      timeRemainingSeconds: true,
      timerStatus: true,
      timerLastStartedAt: true,
      startedAt: true,
    },
  });

  if (!match) throw new NotFoundError("Partai pertandingan tidak ditemukan.");

  const now = new Date();
  const timeRemainingSeconds = getRemainingSeconds(match, now);

  if (input.action === "START") {
    if (match.status === "FINISHED" || timeRemainingSeconds === 0) {
      return getMatchTimerAction(match.id);
    }
    if (match.timerStatus !== "RUNNING") {
      await prisma.match.update({
        where: { id: match.id },
        data: {
          status: "LIVE",
          timerStatus: "RUNNING",
          timeRemainingSeconds,
          timerLastStartedAt: now,
          startedAt: match.startedAt ?? now,
        },
      });
    }
  } else if (input.action === "PAUSE") {
    await prisma.match.update({
      where: { id: match.id },
      data: {
        status: match.status === "LIVE" ? "PAUSED" : match.status,
        timerStatus: timeRemainingSeconds === 0 ? "FINISHED" : "PAUSED",
        timeRemainingSeconds,
        timerLastStartedAt: null,
      },
    });
  } else if (input.action === "RESET") {
    await prisma.match.update({
      where: { id: match.id },
      data: {
        status: match.status === "LIVE" ? "PAUSED" : match.status,
        timerStatus: "READY",
        timeRemainingSeconds: match.roundDurationSeconds,
        timerLastStartedAt: null,
      },
    });
  } else {
    const nextRound = input.action === "NEXT_ROUND"
      ? Math.min(match.totalRounds, match.currentRound + 1)
      : input.round;
    if (!nextRound || !Number.isInteger(nextRound) || nextRound < 1 || nextRound > match.totalRounds) {
      throw new ValidationError("Nomor babak tidak valid.");
    }
    if (input.action === "NEXT_ROUND" && nextRound === match.currentRound) {
      return getMatchTimerAction(match.id);
    }

    await prisma.match.update({
      where: { id: match.id },
      data: {
        status: match.status === "SCHEDULED" ? "SCHEDULED" : "PAUSED",
        currentRound: nextRound,
        timerStatus: "READY",
        timeRemainingSeconds: match.roundDurationSeconds,
        timerLastStartedAt: null,
      },
    });
  }

  return getMatchTimerAction(match.id);
}