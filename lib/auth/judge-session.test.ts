import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@/lib/server/errors";

const state = vi.hoisted(() => ({
  cookieToken: null as string | null,
  sessionUser: null as null | { role: string },
  dbSession: null as null | {
    matchId: string;
    judgeId: string;
    sessionTokenExpiresAt: Date | null;
    judge: { judgeNumber: number; name: string };
  },
}));

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "judge_session" && state.cookieToken
        ? { value: state.cookieToken }
        : undefined,
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    judgeSession: {
      findUnique: async () => state.dbSession,
    },
  },
}));

vi.mock("@/lib/auth/session", () => ({
  SCORING_ROLES: ["ADMIN", "SUPER_ADMIN", "OPERATOR", "JUDGE"],
  getSessionUser: async () => state.sessionUser,
}));

import {
  JUDGE_SESSION_COOKIE,
  getJudgeSession,
  newJudgeSessionToken,
  requireJudgeForMatch,
  requireScoringAccess,
} from "@/lib/auth/judge-session";

function seedDbSession(overrides: Partial<NonNullable<typeof state.dbSession>> = {}) {
  state.dbSession = {
    matchId: "MATCH-1",
    judgeId: "JUDGE-2",
    sessionTokenExpiresAt: new Date(Date.now() + 60_000),
    judge: { judgeNumber: 2, name: "Juri 2" },
    ...overrides,
  };
}

beforeEach(() => {
  state.cookieToken = "token-abc";
  state.sessionUser = null;
  seedDbSession();
});

describe("getJudgeSession", () => {
  it("returns null when the cookie is missing", async () => {
    state.cookieToken = null;

    await expect(getJudgeSession()).resolves.toBeNull();
  });

  it("returns null when the token is unknown", async () => {
    state.dbSession = null;

    await expect(getJudgeSession()).resolves.toBeNull();
  });

  it("returns null when the token has expired", async () => {
    seedDbSession({ sessionTokenExpiresAt: new Date(Date.now() - 1_000) });

    await expect(getJudgeSession()).resolves.toBeNull();
  });

  it("returns the bound match and judge slot for a valid token", async () => {
    await expect(getJudgeSession()).resolves.toEqual({
      matchId: "MATCH-1",
      judgeId: "JUDGE-2",
      judgeNumber: 2,
      judgeName: "Juri 2",
    });
  });
});

describe("requireJudgeForMatch", () => {
  it("throws 401 when there is no device session", async () => {
    state.cookieToken = null;

    const error = await requireJudgeForMatch("MATCH-1").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(UnauthorizedError);
  });

  it("throws 403 when the token belongs to another match", async () => {
    const error = await requireJudgeForMatch("MATCH-9").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ForbiddenError);
  });

  it("throws 403 when the token belongs to another judge slot", async () => {
    const error = await requireJudgeForMatch("MATCH-1", 4).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ForbiddenError);
  });

  it("passes when match and judge slot match the token", async () => {
    const session = await requireJudgeForMatch("MATCH-1", 2);
    expect(session.judgeNumber).toBe(2);
  });
});

describe("requireScoringAccess", () => {
  it("prefers a Supabase session with a scoring role", async () => {
    state.sessionUser = { role: "OPERATOR" };

    const identity = await requireScoringAccess("MATCH-1", 2);
    expect(identity.kind).toBe("supabase");
  });

  it("falls back to the judge token when there is no Supabase session", async () => {
    const identity = await requireScoringAccess("MATCH-1", 2);
    expect(identity.kind).toBe("judge-token");
  });

  it("throws 401 when neither credential exists", async () => {
    state.cookieToken = null;

    const error = await requireScoringAccess("MATCH-1", 2).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(UnauthorizedError);
  });
});

describe("newJudgeSessionToken", () => {
  it("issues unique 64-char hex tokens", () => {
    const first = newJudgeSessionToken();
    const second = newJudgeSessionToken();
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toBe(second);
  });

  it("uses the documented cookie name", () => {
    expect(JUDGE_SESSION_COOKIE).toBe("judge_session");
  });
});
