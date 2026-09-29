import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ matchId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { matchId } = await params;
    const sessions = await prisma.judgeSession.findMany({
      where: { matchId },
      select: {
        accessCode: true,
        judge: { select: { judgeNumber: true, name: true } },
      },
      orderBy: { judge: { judgeNumber: "asc" } },
    });

    return NextResponse.json(sessions.map((session) => ({
      judgeNumber: session.judge.judgeNumber,
      judgeName: session.judge.name,
      accessCode: session.accessCode,
    })));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mengambil kode akses juri.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { matchId } = await params;
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        arena: { select: { judges: { orderBy: { judgeNumber: "asc" }, select: { id: true, judgeNumber: true, name: true } } } },
      },
    });

    if (!match) return NextResponse.json({ error: "Pertandingan tidak ditemukan." }, { status: 404 });
    if (match.arena.judges.length === 0) {
      return NextResponse.json({ error: "Belum ada juri terdaftar pada gelanggang pertandingan ini." }, { status: 400 });
    }

    const generatedSessions = match.arena.judges.map((judge) => ({
      judge,
      accessCode: randomBytes(8).toString("hex").toUpperCase(),
    }));

    await prisma.$transaction(
      generatedSessions.map(({ judge, accessCode }) => prisma.judgeSession.upsert({
        where: { matchId_judgeId: { matchId, judgeId: judge.id } },
        create: { matchId, judgeId: judge.id, accessCode },
        update: { accessCode, loginAt: null, status: "OFFLINE" },
      }))
    );

    return NextResponse.json(generatedSessions.map(({ judge, accessCode }) => ({
      judgeNumber: judge.judgeNumber,
      judgeName: judge.name,
      accessCode,
    })));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal membuat kode akses juri.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}