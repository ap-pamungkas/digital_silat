import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data verifikasi tidak valid." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("matchId" in body) || !("judgeNumber" in body) || !("accessCode" in body)) {
    return NextResponse.json({ error: "Data verifikasi tidak valid." }, { status: 400 });
  }

  const { matchId, judgeNumber, accessCode } = body as {
    matchId: unknown;
    judgeNumber: unknown;
    accessCode: unknown;
  };
  if (
    typeof matchId !== "string" ||
    typeof judgeNumber !== "number" || !Number.isInteger(judgeNumber) || judgeNumber < 1 || judgeNumber > 5 ||
    typeof accessCode !== "string" || !/^[A-F0-9]{16}$/i.test(accessCode)
  ) {
    return NextResponse.json({ error: "Kode akses atau posisi juri tidak valid." }, { status: 400 });
  }

  try {
    const session = await prisma.judgeSession.findFirst({
      where: {
        matchId,
        accessCode: accessCode.toUpperCase(),
        judge: { judgeNumber },
      },
      select: { id: true, judgeId: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Kode akses tidak sesuai dengan kode juri untuk pertandingan ini." }, { status: 401 });
    }

    const loginAt = new Date();
    await prisma.$transaction([
      prisma.judgeSession.update({
        where: { id: session.id },
        data: { loginAt, status: "ONLINE" },
      }),
      prisma.judge.update({
        where: { id: session.judgeId },
        data: { status: "ONLINE", lastActiveAt: loginAt },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Verifikasi kode akses gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}