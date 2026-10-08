import { prisma } from "@/lib/prisma";
import { ConnectionStatus, Judge } from "@/lib/types";
import { ActionResult, ActionResultVoid, isPrismaUniqueConstraintError } from "./shared";
import { syncTournamentStatuses } from "./tournaments";

export const JUDGE_HEARTBEAT_TIMEOUT_MS = 60 * 1000; // 60 seconds

export async function getJudges(): Promise<Judge[]> {
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

    const now = Date.now();
    const staleJudgeIds: string[] = [];

    const mapped = list.map((judge) => {
      const isExpired = now - judge.lastActiveAt.getTime() > JUDGE_HEARTBEAT_TIMEOUT_MS;
      const effectiveStatus: ConnectionStatus = isExpired ? "OFFLINE" : judge.status;
      if (judge.status === "ONLINE" && isExpired) {
        staleJudgeIds.push(judge.id);
      }

      return {
        id: judge.id || `JURI-${judge.arena.arenaCode}-${judge.judgeNumber}`,
        judgeNumber: judge.judgeNumber,
        name: judge.name,
        licenseNumber: judge.licenseNumber ?? undefined,
        arenaId: judge.arena.arenaCode,
        status: effectiveStatus,
        batteryLevel: judge.batteryLevel ?? undefined,
        pingMs: judge.pingMs ?? undefined,
        lastActive: judge.lastActiveAt.toLocaleString("id-ID", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        device: judge.device ?? undefined,
      };
    });

    if (staleJudgeIds.length > 0) {
      await prisma.judge.updateMany({
        where: { id: { in: staleJudgeIds } },
        data: { status: "OFFLINE" },
      }).catch(() => {});
    }

    return mapped;
  } catch (error) {
    console.error("Error in getJudges:", error);
    return [];
  }
}

export async function createJudgeAction(data: {
  arenaId: string;
  judgeNumber: number;
  name: string;
  licenseNumber?: string;
}): Promise<ActionResult<Judge>> {
  try {
    if (!Number.isInteger(data.judgeNumber) || data.judgeNumber < 1 || data.judgeNumber > 5) {
      throw new Error("Nomor juri harus antara 1 sampai 5.");
    }
    const name = data.name.trim();
    if (!name) throw new Error("Nama juri wajib diisi.");

    const tournament = await prisma.tournament.findFirst({
      where: { status: "ONGOING" },
      orderBy: { createdAt: "desc" },
    }) || await prisma.tournament.findFirst({ orderBy: { createdAt: "desc" } });
    if (!tournament) throw new Error("Turnamen belum tersedia.");

    const arena = await prisma.arena.findFirst({
      where: { tournamentId: tournament.id, arenaCode: data.arenaId },
      select: { id: true, arenaCode: true },
    });
    if (!arena) throw new Error("Gelanggang tidak ditemukan pada turnamen aktif.");

    const judge = await prisma.judge.create({
      data: {
        arenaId: arena.id,
        judgeNumber: data.judgeNumber,
        name: name.toUpperCase(),
        licenseNumber: data.licenseNumber?.trim() || null,
      },
      select: {
        id: true,
        judgeNumber: true,
        name: true,
        licenseNumber: true,
        status: true,
        batteryLevel: true,
        pingMs: true,
        device: true,
        lastActiveAt: true,
      },
    });

    return {
      success: true,
      data: {
        id: judge.id,
        judgeNumber: judge.judgeNumber,
        name: judge.name,
        licenseNumber: judge.licenseNumber ?? undefined,
        arenaId: arena.arenaCode,
        status: judge.status,
        batteryLevel: judge.batteryLevel ?? undefined,
        pingMs: judge.pingMs ?? undefined,
        lastActive: judge.lastActiveAt.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }),
        device: judge.device ?? undefined,
      } satisfies Judge,
    };
  } catch (error: unknown) {
    return {
      success: false,
      status: 400,
      error: isPrismaUniqueConstraintError(error)
        ? "Nomor juri tersebut sudah terdaftar pada gelanggang ini."
        : error instanceof Error ? error.message : "Gagal mendaftarkan juri.",
    };
  }
}

export async function updateJudgeAction(id: string, data: { name?: string; licenseNumber?: string; status?: ConnectionStatus; pingMs?: number; batteryLevel?: number }): Promise<ActionResult<Judge>> {
  try {
    const judge = await prisma.judge.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.toUpperCase() }),
        ...(data.licenseNumber !== undefined && { licenseNumber: data.licenseNumber }),
        ...(data.status && { status: data.status }),
        ...(data.pingMs !== undefined && { pingMs: data.pingMs }),
        ...(data.batteryLevel !== undefined && { batteryLevel: data.batteryLevel }),
      },
      select: {
        id: true,
        arenaId: true,
        judgeNumber: true,
        name: true,
        licenseNumber: true,
        status: true,
        batteryLevel: true,
        pingMs: true,
        device: true,
        lastActiveAt: true,
      },
    });
    const arena = await prisma.arena.findUnique({
      where: { id: judge.arenaId },
      select: { arenaCode: true },
    });
    if (!arena) throw new Error("Gelanggang juri tidak ditemukan.");

    return {
      success: true,
      data: {
        id: judge.id,
        judgeNumber: judge.judgeNumber,
        name: judge.name,
        licenseNumber: judge.licenseNumber ?? undefined,
        arenaId: arena.arenaCode,
        status: judge.status,
        batteryLevel: judge.batteryLevel ?? undefined,
        pingMs: judge.pingMs ?? undefined,
        lastActive: judge.lastActiveAt.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }),
        device: judge.device ?? undefined,
      } satisfies Judge,
    };
  } catch (error: unknown) {
    return {
      success: false,
      status: 400,
      error: error instanceof Error ? error.message : "Gagal mengupdate juri.",
    };
  }
}

export async function deleteJudgeAction(id: string): Promise<ActionResultVoid> {
  try {
    await prisma.judge.delete({ where: { id } });
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      status: 400,
      error: error instanceof Error ? error.message : "Gagal menghapus juri.",
    };
  }
}