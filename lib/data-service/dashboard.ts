import { prisma } from "@/lib/prisma";
import { getArenas } from "./arenas";
import { getMatches } from "./matches";
import { formatDateIndo } from "./shared";
import { syncTournamentStatuses } from "./tournaments";

export async function getDashboardData() {
  try {
    await syncTournamentStatuses().catch(() => {});
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
      matchesList.find((match) => match.status === "LIVE") ||
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
            status: tournament.status,
            totalArenas: tournament._count?.arenas || totalArenas,
            totalMatches: tournament._count?.matches || totalMatches,
            totalAthletes,
          }
        : null,
      stats: {
        totalAthletes,
        totalMatches,
        finishedMatches,
        totalArenas,
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
