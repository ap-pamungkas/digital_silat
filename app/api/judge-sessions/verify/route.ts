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

  const session = await prisma.judgeSession.findFirst({
    where: {
      matchId: parsed.data.matchId,
      accessCode: parsed.data.accessCode.toUpperCase(),
      judge: { judgeNumber: parsed.data.judgeNumber },
    },
    select: { id: true, judgeId: true },
  });

  if (!session) {
    throw new UnauthorizedError(
      "Kode akses tidak sesuai dengan kode juri untuk pertandingan ini."
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
      where: { id: session.judgeId },
      data: { status: "ONLINE", lastActiveAt: loginAt },
    }),
  ]);

  const response = NextResponse.json({ data: { success: true } });
  response.cookies.set(JUDGE_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(JUDGE_SESSION_TTL_MS / 1000),
    secure: process.env.NODE_ENV === "production",
  });
  return response;
});
