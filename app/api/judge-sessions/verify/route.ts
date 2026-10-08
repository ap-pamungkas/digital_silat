import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRouteHandler, parseJson } from "@/lib/server/handler";
import { UnauthorizedError, ValidationError } from "@/lib/server/errors";
import { verifyJudgeSessionSchema } from "@/lib/validation";
import {
  JUDGE_SESSION_COOKIE,
  JUDGE_SESSION_TTL_MS,
  judgeSessionExpiry,
  newJudgeSessionToken,
} from "@/lib/auth/judge-session";

/**
 * Public on purpose: the operator-generated access code IS the judge's
 * credential. Judges never log in with email/password. On success the
 * device receives an HttpOnly cookie bound to this match + judge slot.
 */
export const POST = withRouteHandler(async (request) => {
  let body: unknown;
  try {
    body = await parseJson(request);
  } catch {
    throw new ValidationError("Data verifikasi tidak valid.");
  }

  const parsed = verifyJudgeSessionSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Kode akses atau posisi juri tidak valid.");
  }

  const code = parsed.data.accessCode.toUpperCase();

  // Try matching with both matchId (if valid) and judgeNumber (if provided)
  let session = await prisma.judgeSession.findFirst({
    where: {
      accessCode: code,
      ...(parsed.data.matchId && parsed.data.matchId !== "NO_MATCH"
        ? { matchId: parsed.data.matchId }
        : {}),
      ...(parsed.data.judgeNumber ? { judge: { judgeNumber: parsed.data.judgeNumber } } : {}),
    },
    include: {
      judge: { select: { id: true, judgeNumber: true, name: true } },
      match: {
        select: {
          id: true,
          matchNumber: true,
          arenaId: true,
          status: true,
          arena: { select: { id: true, arenaCode: true, name: true } },
        },
      },
    },
  });

  // If not found with the specific matchId/judgeNumber, search by accessCode alone
  // (accessCode is a 16-hex random string with 64-bit entropy, uniquely identifying a match & judge slot)
  if (!session) {
    session = await prisma.judgeSession.findFirst({
      where: { accessCode: code },
      include: {
        judge: { select: { id: true, judgeNumber: true, name: true } },
        match: {
          select: {
            id: true,
            matchNumber: true,
            arenaId: true,
            status: true,
            arena: { select: { id: true, arenaCode: true, name: true } },
          },
        },
      },
    });
  }

  if (!session) {
    throw new UnauthorizedError(
      "Kode akses tidak valid. Pastikan 16 digit kode sesuai dengan yang tercantum di panel operator."
    );
  }

  // If judgeNumber was specified by the user and differs from the registered code
  if (parsed.data.judgeNumber && session.judge.judgeNumber !== parsed.data.judgeNumber) {
    throw new UnauthorizedError(
      `Kode akses ini terdaftar untuk Juri ${session.judge.judgeNumber} (${session.judge.name}), bukan Juri ${parsed.data.judgeNumber}. Silakan pilih posisi Juri ${session.judge.judgeNumber} atau periksa kembali kode akses Anda.`
    );
  }

  const loginAt = new Date();
  const sessionToken = newJudgeSessionToken();
  await prisma.$transaction([
    prisma.judgeSession.update({
      where: { id: session.id },
      data: {
        loginAt,
        status: "ONLINE",
        sessionToken,
        sessionTokenExpiresAt: judgeSessionExpiry(loginAt),
      },
    }),
    prisma.judge.update({
      where: { id: session.judge.id },
      data: { status: "ONLINE", lastActiveAt: loginAt },
    }),
  ]);

  const response = NextResponse.json({
    success: true,
    matchId: session.matchId,
    judgeNumber: session.judge.judgeNumber,
    judgeName: session.judge.name,
    matchNumber: session.match.matchNumber,
    arenaName: session.match.arena?.name ?? "Gelanggang",
  });
  response.cookies.set(JUDGE_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(JUDGE_SESSION_TTL_MS / 1000),
    secure: process.env.NODE_ENV === "production",
  });
  return response;
});
