import { prisma } from "@/lib/prisma";
import { ConnectionStatus, Judge } from "@/lib/types";

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

    return list.map((judge) => ({
      id: judge.id || `JURI-${judge.arena.arenaCode}-${judge.judgeNumber}`,
      judgeNumber: judge.judgeNumber,
      name: judge.name,
      licenseNumber: judge.licenseNumber ?? undefined,
      arenaId: judge.arena.arenaCode,
      status: judge.status as "ONLINE" | "SYNCING" | "RECONNECTING" | "OFFLINE",
      batteryLevel: judge.batteryLevel ?? undefined,
      pingMs: judge.pingMs ?? undefined,
      lastActive: judge.lastActiveAt.toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      device: judge.device ?? undefined,
    }));
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
}) {
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
      success: true as const,
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
    const isDuplicate = typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
    return {
      success: false as const,
      error: isDuplicate
        ? "Nomor juri tersebut sudah terdaftar pada gelanggang ini."
        : error instanceof Error ? error.message : "Gagal mendaftarkan juri.",
    };
  }
}

export async function updateJudgeAction(id: string, data: { name?: string; licenseNumber?: string; status?: ConnectionStatus; pingMs?: number; batteryLevel?: number }) {
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
      success: true as const,
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
      success: false as const,
      error: error instanceof Error ? error.message : "Gagal mengupdate juri.",
    };
  }
}

export async function deleteJudgeAction(id: string) {
  try {
    await prisma.judge.delete({ where: { id } });
    return { success: true as const };
  } catch (error: unknown) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Gagal menghapus juri.",
    };
  }
}