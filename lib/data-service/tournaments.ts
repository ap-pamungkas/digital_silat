import { prisma } from "@/lib/prisma";
import type { Tournament, TournamentStatus } from "@/lib/types";
import { formatDateIndo } from "./shared";
import type { ActionResult } from "./shared";

export type UpdateTournamentInput = {
  name?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: TournamentStatus;
};

async function mapTournament(tournament: {
  id: string;
  code: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: TournamentStatus;
  _count: { arenas: number; matches: number };
}): Promise<Tournament> {
  const athleteCount = await prisma.athlete.count();

  return {
    id: tournament.code,
    name: tournament.name,
    location: tournament.location,
    startDate: formatDateIndo(tournament.startDate),
    endDate: formatDateIndo(tournament.endDate),
    status: tournament.status,
    totalArenas: tournament._count.arenas,
    totalMatches: tournament._count.matches,
    totalAthletes: athleteCount,
  };
}

const tournamentInclude = {
  _count: { select: { arenas: true, matches: true } },
} as const;

export function resolveTournamentStatus(
  startDate: Date,
  endDate: Date,
  currentStatus: TournamentStatus,
  referenceDate: Date = new Date(),
  hasUnfinishedMatches: boolean = false
): TournamentStatus {
  if (currentStatus === "ARCHIVED") {
    return "ARCHIVED";
  }

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (referenceDate.getTime() > end.getTime()) {
    // Larang turnamen selesai jika masih ada partai aktif atau belum selesai
    if (hasUnfinishedMatches) {
      return "ONGOING";
    }
    return "COMPLETED";
  }
  if (referenceDate.getTime() >= start.getTime()) {
    return "ONGOING";
  }
  return "UPCOMING";
}

export async function syncTournamentStatuses(): Promise<void> {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        matches: {
          where: {
            status: { in: ["SCHEDULED", "READY", "LIVE", "PAUSED"] },
          },
          select: { id: true },
        },
      },
    });

    const now = new Date();
    const updates = tournaments
      .map((t) => {
        const hasUnfinishedMatches = t.matches && t.matches.length > 0;
        const nextStatus = resolveTournamentStatus(
          t.startDate,
          t.endDate,
          t.status,
          now,
          hasUnfinishedMatches
        );
        if (nextStatus !== t.status) {
          return prisma.tournament.update({
            where: { id: t.id },
            data: { status: nextStatus },
          });
        }
        return null;
      })
      .filter((u): u is NonNullable<typeof u> => u !== null);

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }
  } catch (err) {
    console.error("Failed to sync tournament statuses:", err);
  }
}

export async function getTournaments(): Promise<Tournament[]> {
  try {
    await syncTournamentStatuses();

    const list = await prisma.tournament.findMany({
      include: tournamentInclude,
      orderBy: { startDate: "asc" },
    });

    if (!list.length) return [];

    const athleteCount = await prisma.athlete.count();

    return list.map((tournament) => ({
      id: tournament.code,
      name: tournament.name,
      location: tournament.location,
      startDate: formatDateIndo(tournament.startDate),
      endDate: formatDateIndo(tournament.endDate),
      status: tournament.status,
      totalArenas: tournament._count.arenas,
      totalMatches: tournament._count.matches,
      totalAthletes: athleteCount,
    }));
  } catch (error) {
    console.error("Error in getTournaments:", error);
    return [];
  }
}

export async function updateTournamentAction(
  code: string,
  input: UpdateTournamentInput
): Promise<ActionResult<Tournament>> {
  try {
    const existing = await prisma.tournament.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, status: 404, error: "Turnamen tidak ditemukan." };
    }

    const data: {
      name?: string;
      location?: string;
      startDate?: Date;
      endDate?: Date;
      status?: TournamentStatus;
    } = {};

    if (input.name !== undefined) data.name = input.name.toUpperCase();
    if (input.location !== undefined) data.location = input.location;
    if (input.status !== undefined) data.status = input.status;
    if (input.startDate !== undefined) {
      const parsed = new Date(input.startDate);
      if (Number.isNaN(parsed.getTime())) {
        return { success: false, status: 400, error: "Tanggal mulai tidak valid." };
      }
      data.startDate = parsed;
    }
    if (input.endDate !== undefined) {
      const parsed = new Date(input.endDate);
      if (Number.isNaN(parsed.getTime())) {
        return { success: false, status: 400, error: "Tanggal selesai tidak valid." };
      }
      data.endDate = parsed;
    }

    const updated = await prisma.tournament.update({
      where: { id: existing.id },
      data,
      include: tournamentInclude,
    });

    return { success: true, data: await mapTournament(updated) };
  } catch (error: unknown) {
    console.error("Error in updateTournamentAction:", error);
    return { success: false, status: 500, error: "Gagal memperbarui turnamen." };
  }
}

export async function deleteTournamentAction(code: string): Promise<ActionResult<null>> {
  try {
    const result = await prisma.tournament.deleteMany({ where: { code } });

    if (result.count === 0) {
      return { success: false, status: 404, error: "Tournament not found." };
    }

    return { success: true, data: null };
  } catch (error: unknown) {
    console.error("Error in deleteTournamentAction:", error);
    return { success: false, status: 500, error: "Failed to delete tournament." };
  }
}