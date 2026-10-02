import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, UnauthorizedError } from "@/lib/server/errors";
import {
  SCORING_ROLES,
  getSessionUser,
  type SessionUser,
} from "@/lib/auth/session";

/**
 * Device session for judges.
 *
 * Judges never log in with email/password. The operator generates a
 * per-match access code for each judge slot (JURI 1..5); verifying the code
 * issues a random opaque token stored on `JudgeSession` and mirrored in an
 * HttpOnly cookie. Score and penalty writes accept this token as an
 * alternative to a Supabase session.
 */

export const JUDGE_SESSION_COOKIE = "judge_session";

/** 12 hours: long enough for a competition day, short enough to expire overnight. */
export const JUDGE_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export interface JudgeDeviceSession {
  matchId: string;
  judgeId: string;
  judgeNumber: number;
  judgeName: string;
}

export type ScoringIdentity =
  | { kind: "supabase"; user: SessionUser }
  | { kind: "judge-token"; session: JudgeDeviceSession };

export function newJudgeSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function judgeSessionExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + JUDGE_SESSION_TTL_MS);
}

/** Returns the judge device session bound to the request cookie, or null. */
export async function getJudgeSession(): Promise<JudgeDeviceSession | null> {
  const store = await cookies();
  const token = store.get(JUDGE_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.judgeSession.findUnique({
    where: { sessionToken: token },
    select: {
      matchId: true,
      judgeId: true,
      sessionTokenExpiresAt: true,
      judge: { select: { judgeNumber: true, name: true } },
    },
  });

  if (
    !session ||
    !session.sessionTokenExpiresAt ||
    session.sessionTokenExpiresAt.getTime() <= Date.now()
  ) {
    return null;
  }

  return {
    matchId: session.matchId,
    judgeId: session.judgeId,
    judgeNumber: session.judge.judgeNumber,
    judgeName: session.judge.name,
  };
}

/**
 * Requires a judge device session for the given match. When `judgeNumber`
 * is provided the token must belong to that exact judge slot.
 */
export async function requireJudgeForMatch(
  matchId: string,
  judgeNumber?: number
): Promise<JudgeDeviceSession> {
  const session = await getJudgeSession();
  if (!session) {
    throw new UnauthorizedError(
      "Perangkat juri belum masuk. Minta kode akses dari operator."
    );
  }
  if (session.matchId !== matchId) {
    throw new ForbiddenError(
      "Kode akses perangkat ini berlaku untuk pertandingan lain."
    );
  }
  if (judgeNumber !== undefined && session.judgeNumber !== judgeNumber) {
    throw new ForbiddenError(
      "Kode akses perangkat ini tidak berlaku untuk posisi juri tersebut."
    );
  }
  return session;
}

/**
 * Scoring writes accept either a Supabase session with a scoring role
 * (operator path) or a judge device token bound to the match (judge path).
 */
export async function requireScoringAccess(
  matchId: string,
  judgeNumber?: number
): Promise<ScoringIdentity> {
  const user = await getSessionUser();
  if (user && SCORING_ROLES.includes(user.role)) {
    return { kind: "supabase", user };
  }
  const session = await requireJudgeForMatch(matchId, judgeNumber);
  return { kind: "judge-token", session };
}
