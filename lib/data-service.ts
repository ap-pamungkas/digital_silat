import { prisma } from "./prisma";
import {
  Athlete,
  Match,
  Arena,
  Judge,
  Tournament,
  ScoreEvent,
  PenaltyRecord,
} from "./types";

/**
 * Format tanggal ke format Indonesia
 */
function formatDateIndo(date: Date): string {
  try {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).toUpperCase();
  } catch {
    return date.toISOString().split("T")[0];
  }
}

function parseScheduledDate(value?: string): Date {
  if (!value) return new Date();

  const parsedDate = new Date(value);
  if (!Number.isNaN(parsedDate.getTime())) return parsedDate;

  const timeParts = /^(?:([01]\d|2[0-3])):([0-5]\d)$/.exec(value);
  if (!timeParts) throw new Error("Format waktu pertandingan tidak valid.");

  const scheduledDate = new Date();
  scheduledDate.setHours(Number(timeParts[1]), Number(timeParts[2]), 0, 0);
  return scheduledDate;
}

/**
 * 1. Ambil Data Turnamen Aktif & Ringkasan Dashboard
 */
export async function getDashboardData() {
  try {
    const tournament =
      (await prisma.tournament.findFirst({
        where: { status: "ONGOING" },
        include: {
          _count: {
            select: {
              arenas: true,
              matches: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })) ||
      (await prisma.tournament.findFirst({
        include: {
          _count: {
            select: {
              arenas: true,
              matches: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }));

    const totalAthletes = await prisma.athlete.count();
    const totalMatches = await prisma.match.count();
    const totalArenas = await prisma.arena.count();
    const finishedMatches = await prisma.match.count({
      where: { status: "FINISHED" },
    });

    const matchesList = await getMatches();
    const arenas = await getArenas();
    const auditLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    const activeMatch =
      matchesList.find((m) => m.status === "LIVE") ||
      matchesList[0] ||
      null;

    return {
      tournament: tournament
        ? {
            id: tournament.code,
            name: tournament.name,
            location: tournament.location,
            startDate: formatDateIndo(tournament.startDate),
            endDate: formatDateIndo(tournament.endDate),
            status: tournament.status as "ONGOING" | "UPCOMING" | "COMPLETED",
            totalArenas: tournament._count?.arenas || totalArenas,
            totalMatches: tournament._count?.matches || totalMatches,
            totalAthletes: totalAthletes,
          }
        : null,
      stats: {
        totalAthletes: totalAthletes,
        totalMatches: totalMatches,
        finishedMatches: finishedMatches,
        totalArenas: totalArenas,
        matchesToday: matchesList.length,
      },
      matches: matchesList,
      activeMatch,
      arenas,
      auditLogs,
    };
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return {
      tournament: null,
      stats: {
        totalAthletes: 0,
        totalMatches: 0,
        finishedMatches: 0,
        totalArenas: 0,
        matchesToday: 0,
      },
      matches: [],
      activeMatch: null,
      arenas: [],
      auditLogs: [],
    };
  }
}

/**
 * 2. Ambil Daftar Semua Turnamen
 */
export async function getTournaments(): Promise<Tournament[]> {
  try {
    const list = await prisma.tournament.findMany({
      include: {
        _count: {
          select: {
            arenas: true,
            matches: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    if (!list.length) return [];

    const athleteCount = await prisma.athlete.count();

    return list.map((t) => ({
      id: t.code,
      name: t.name,
      location: t.location,
      startDate: formatDateIndo(t.startDate),
      endDate: formatDateIndo(t.endDate),
      status: t.status as "ONGOING" | "UPCOMING" | "COMPLETED",
      totalArenas: t._count.arenas,
      totalMatches: t._count.matches,
      totalAthletes: athleteCount,
    }));
  } catch (error) {
    console.error("Error in getTournaments:", error);
    return [];
  }
}

/**
 * 3. Ambil Daftar Semua Atlet
 */
export async function getAthletes(): Promise<Athlete[]> {
  try {
    const list = await prisma.athlete.findMany({
      include: {
        contingent: true,
        category: true,
      },
      orderBy: { name: "asc" },
    });

    if (!list.length) return [];

    return list.map((a) => ({
      id: a.id,
      name: a.name,
      contingent: a.contingent.name,
      contingentCode: a.contingent.code,
      gender: a.gender as "PUTRA" | "PUTRI",
      weightClass: a.category.categoryClass,
      avatarUrl: a.avatarUrl || undefined,
      seed: a.seed || undefined,
    }));
  } catch (error) {
    console.error("Error in getAthletes:", error);
    return [];
  }
}

/**
 * 4. Ambil Daftar Wasit Juri
 */
export async function getJudges(): Promise<Judge[]> {
  try {
    const activeTour =
      (await prisma.tournament.findFirst({
        where: { status: "ONGOING" },
        orderBy: { createdAt: "desc" },
      })) ||
      (await prisma.tournament.findFirst({
        orderBy: { createdAt: "desc" },
      }));

    const whereClause = activeTour ? { arena: { tournamentId: activeTour.id } } : {};

    const list = await prisma.judge.findMany({
      where: whereClause,
      include: {
        arena: true,
      },
      orderBy: [
        { arena: { arenaNumber: "asc" } },
        { judgeNumber: "asc" },
      ],
    });

    if (!list.length) return [];

    return list.map((j) => ({
      id: j.id || `JURI-${j.arena.arenaCode}-${j.judgeNumber}`,
      judgeNumber: j.judgeNumber,
      name: j.name,
      arenaId: j.arena.arenaCode,
      status: j.status as "ONLINE" | "SYNCING" | "RECONNECTING" | "OFFLINE",
      batteryLevel: j.batteryLevel ?? undefined,
      pingMs: j.pingMs ?? undefined,
      lastActive: j.lastActiveAt.toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      device: j.device ?? undefined,
    }));
  } catch (error) {
    console.error("Error in getJudges:", error);
    return [];
  }
}

/**
 * 5. Ambil Daftar Gelanggang
 */
export async function getArenas(): Promise<Arena[]> {
  try {
    const activeTour =
      (await prisma.tournament.findFirst({
        where: { status: "ONGOING" },
        orderBy: { createdAt: "desc" },
      })) ||
      (await prisma.tournament.findFirst({
        orderBy: { createdAt: "desc" },
      }));

    const whereClause = activeTour ? { tournamentId: activeTour.id } : {};

    const list = await prisma.arena.findMany({
      where: whereClause,
      include: {
        judges: true,
      },
      orderBy: { arenaNumber: "asc" },
    });

    if (!list.length) return [];

    const seenCodes = new Set<string>();
    const result: Arena[] = [];

    for (const ar of list) {
      // Prevent duplicate arenaCode if any exists in DB
      const code = seenCodes.has(ar.arenaCode) ? `${ar.arenaCode}-${ar.id}` : ar.arenaCode;
      seenCodes.add(ar.arenaCode);

      const connectedCount = ar.judges.filter((j) => j.status === "ONLINE").length;
      result.push({
        id: code,
        name: ar.name,
        currentMatchId: ar.currentMatchId || undefined,
        status: ar.status as "ACTIVE" | "IDLE" | "MAINTENANCE",
        connectedJudgesCount: connectedCount,
        totalJudgesCount: ar.judges.length,
        displayConnected: ar.displayConnected,
        obsConnected: ar.obsConnected,
      });
    }

    return result;
  } catch (error) {
    console.error("Error in getArenas:", error);
    return [];
  }
}

/**
 * 6. Ambil Daftar Partai Pertandingan (Matches)
 */
export async function getMatches(): Promise<Match[]> {
  try {
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

    return list.map((m) => {
      const redPenalties: PenaltyRecord[] = m.penalties
        .filter((p) => p.corner === "RED")
        .map((p) => ({
          id: p.id,
          matchId: p.matchId,
          corner: "RED" as const,
          type: p.type as any,
          pointsDeducted: p.pointsDeducted,
          round: p.round,
          timestamp: p.timestamp.getTime(),
          refereeNote: p.refereeNote || undefined,
        }));

      const bluePenalties: PenaltyRecord[] = m.penalties
        .filter((p) => p.corner === "BLUE")
        .map((p) => ({
          id: p.id,
          matchId: p.matchId,
          corner: "BLUE" as const,
          type: p.type as any,
          pointsDeducted: p.pointsDeducted,
          round: p.round,
          timestamp: p.timestamp.getTime(),
          refereeNote: p.refereeNote || undefined,
        }));

      const events: ScoreEvent[] = m.scoreEvents.map((e) => ({
        id: e.id,
        matchId: e.matchId,
        judgeId: e.judgeId,
        judgeNumber: e.judgeNumber,
        corner: e.corner as "RED" | "BLUE",
        action: e.action as any,
        points: e.points,
        round: e.round,
        matchTime: e.matchTime,
        timestamp: e.createdAt.getTime(),
        verified: e.verified,
        status: e.status as "VERIFIED" | "PENDING" | "REJECTED",
      }));

      const scheduledTimeStr = m.scheduledTime
        ? `${String(m.scheduledTime.getUTCHours()).padStart(2, "0")}:${String(
            m.scheduledTime.getUTCMinutes()
          ).padStart(2, "0")} WIB`
        : "Belum ditentukan";

      return {
        id: m.id,
        matchNumber: m.matchNumber,
        arenaId: m.arena.arenaCode,
        arenaName: m.arena.name,
        tournamentId: m.tournament.code,
        tournamentName: m.tournament.name,
        category: m.category.name,
        stage: `BABAK ${m.stage.replace(/_/g, " ")}`,
        redAthlete: {
          id: m.redAthlete.id,
          name: m.redAthlete.name,
          contingent: m.redAthlete.contingent.name,
          contingentCode: m.redAthlete.contingent.code,
          gender: m.redAthlete.gender as "PUTRA" | "PUTRI",
          weightClass: m.redAthlete.category.categoryClass,
          seed: m.redAthlete.seed || undefined,
        },
        blueAthlete: {
          id: m.blueAthlete.id,
          name: m.blueAthlete.name,
          contingent: m.blueAthlete.contingent.name,
          contingentCode: m.blueAthlete.contingent.code,
          gender: m.blueAthlete.gender as "PUTRA" | "PUTRI",
          weightClass: m.blueAthlete.category.categoryClass,
          seed: m.blueAthlete.seed || undefined,
        },
        redScore: m.redScore,
        blueScore: m.blueScore,
        currentRound: m.currentRound,
        totalRounds: m.totalRounds,
        timeRemainingSeconds: m.timeRemainingSeconds,
        roundDurationSeconds: m.roundDurationSeconds,
        timerStatus: m.timerStatus as any,
        status: m.status as any,
        winner: (m.winnerCorner as "RED" | "BLUE") || undefined,
        winReason: m.winReason ? m.winReason.replace(/_/g, " ") : undefined,
        scheduledTime: scheduledTimeStr,
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

/**
 * 7. Tambah Atlet Baru ke Database
 */
export async function createAthleteAction(data: {
  name: string;
  contingentName: string;
  contingentCode?: string;
  gender: "PUTRA" | "PUTRI";
  weightClassName?: string;
}) {
  try {
    const tournament = await prisma.tournament.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!tournament) throw new Error("Turnamen belum tersedia.");

    // Cari atau buat kontingen
    let contingent = await prisma.contingent.findFirst({
      where: {
        tournamentId: tournament.id,
        name: { equals: data.contingentName, mode: "insensitive" },
      },
    });

    if (!contingent) {
      contingent = await prisma.contingent.create({
        data: {
          tournamentId: tournament.id,
          name: data.contingentName.toUpperCase(),
          code: (
            data.contingentCode || data.contingentName.slice(0, 3)
          ).toUpperCase(),
        },
      });
    }

    // Cari atau buat category
    let category = await prisma.category.findFirst({
      where: {
        tournamentId: tournament.id,
        gender: data.gender,
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          tournamentId: tournament.id,
          name: `TANDING - ${data.weightClassName || "KELAS A"} ${data.gender}`,
          categoryClass: data.weightClassName || "KELAS A (45-50 kg)",
          gender: data.gender,
          type: "TANDING",
        },
      });
    }

    const newAthlete = await prisma.athlete.create({
      data: {
        contingentId: contingent.id,
        categoryId: category.id,
        name: data.name.toUpperCase(),
        gender: data.gender,
        medicalCleared: true,
      },
      include: {
        contingent: true,
        category: true,
      },
    });

    return {
      success: true,
      data: {
        id: newAthlete.id,
        name: newAthlete.name,
        contingent: newAthlete.contingent.name,
        contingentCode: newAthlete.contingent.code,
        gender: newAthlete.gender as "PUTRA" | "PUTRI",
        weightClass: newAthlete.category.categoryClass,
      },
    };
  } catch (error: any) {
    console.error("Failed to create athlete:", error);
    return { success: false, error: error?.message || "Gagal menyimpan atlet" };
  }
}

/**
 * 8. Tambah Partai Pertandingan Baru (Create Match)
 */
export async function createMatchAction(data: {
  tournamentId?: string;
  arenaId: string;
  categoryId?: string;
  categoryName?: string;
  matchNumber: string;
  stage?: "PENYISIHAN" | "PEREMPAT_FINAL" | "SEMI_FINAL" | "FINAL" | "PEREBUTAN_JUARA_3";
  redAthleteId: string;
  blueAthleteId: string;
  scheduledTime?: string;
}) {
  try {
    const tournament = data.tournamentId
      ? await prisma.tournament.findUnique({ where: { code: data.tournamentId } })
      : await prisma.tournament.findFirst({
          where: { status: "ONGOING" },
          orderBy: { createdAt: "desc" },
        }) || (await prisma.tournament.findFirst({ orderBy: { createdAt: "desc" } }));

    if (!tournament) throw new Error("Turnamen tidak ditemukan.");

    // Find arena
    const arena = await prisma.arena.findFirst({
      where: {
        tournamentId: tournament.id,
        arenaCode: data.arenaId,
      },
    });

    if (!arena) throw new Error("Gelanggang tidak ditemukan.");

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

    if (!redAthlete || !blueAthlete) throw new Error("Atlet tidak ditemukan.");
    if (
      redAthlete.contingent.tournamentId !== tournament.id ||
      blueAthlete.contingent.tournamentId !== tournament.id
    ) {
      throw new Error("Atlet tidak terdaftar pada turnamen ini.");
    }
    if (redAthlete.categoryId !== blueAthlete.categoryId) {
      throw new Error("Kedua atlet harus berada pada kategori yang sama.");
    }
    if (data.categoryId && data.categoryId !== redAthlete.categoryId) {
      throw new Error("Kategori pertandingan tidak sesuai dengan kategori atlet.");
    }

    const category = await prisma.category.findFirst({
      where: { id: redAthlete.categoryId, tournamentId: tournament.id },
    });
    if (!category) throw new Error("Kategori atlet tidak ditemukan pada turnamen ini.");

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
        scheduledTime: parseScheduledDate(data.scheduledTime),
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
      success: true,
      data: newMatch,
    };
  } catch (error: any) {
    console.error("Failed to create match:", error);
    return { success: false, error: error?.message || "Gagal membuat partai pertandingan" };
  }
}

/**
 * 9. Update Status Pertandingan & Pemenang
 */
export async function updateMatchStatusAction(data: {
  matchId: string;
  status: "SCHEDULED" | "READY" | "LIVE" | "PAUSED" | "FINISHED" | "CANCELLED";
  winnerCorner?: "RED" | "BLUE";
  winReason?: string;
}) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: data.matchId },
    });

    if (!match) throw new Error("Partai pertandingan tidak ditemukan.");

    let winnerAthleteId = null;
    if (data.winnerCorner === "RED") {
      winnerAthleteId = match.redAthleteId;
    } else if (data.winnerCorner === "BLUE") {
      winnerAthleteId = match.blueAthleteId;
    }

    const updated = await prisma.match.update({
      where: { id: data.matchId },
      data: {
        status: data.status,
        winnerCorner: data.winnerCorner || null,
        winnerAthleteId: winnerAthleteId,
        winReason: (data.winReason as any) || undefined,
        endedAt: data.status === "FINISHED" ? new Date() : undefined,
        startedAt: data.status === "LIVE" && !match.startedAt ? new Date() : undefined,
      },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to update match status:", error);
    return { success: false, error: error?.message || "Gagal mengupdate status pertandingan" };
  }
}

