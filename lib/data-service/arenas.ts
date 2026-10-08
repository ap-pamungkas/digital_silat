import { prisma } from "@/lib/prisma";
import { Arena } from "@/lib/types";
import { syncTournamentStatuses } from "./tournaments";
import { JUDGE_HEARTBEAT_TIMEOUT_MS } from "./judges";

export async function getArenas(): Promise<Arena[]> {
  try {
    await syncTournamentStatuses().catch(() => {});
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

    const now = Date.now();
    const seenCodes = new Set<string>();
    const result: Arena[] = [];

    for (const arena of list) {
      const code = seenCodes.has(arena.arenaCode) ? `${arena.arenaCode}-${arena.id}` : arena.arenaCode;
      seenCodes.add(arena.arenaCode);

      const connectedCount = arena.judges.filter(
        (judge) =>
          judge.status === "ONLINE" &&
          now - judge.lastActiveAt.getTime() <= JUDGE_HEARTBEAT_TIMEOUT_MS
      ).length;
      result.push({
        id: code,
        name: arena.name,
        currentMatchId: arena.currentMatchId || undefined,
        status: arena.status as "ACTIVE" | "IDLE" | "MAINTENANCE",
        connectedJudgesCount: connectedCount,
        totalJudgesCount: arena.judges.length,
        displayConnected: arena.displayConnected,
        obsConnected: arena.obsConnected,
      });
    }

    return result;
  } catch (error) {
    console.error("Error in getArenas:", error);
    return [];
  }
}