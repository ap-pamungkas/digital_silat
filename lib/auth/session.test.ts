import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@/lib/server/errors";

const state = vi.hoisted(() => ({
  authUser: null as null | { id: string; email: string },
  authError: null as null | { message: string },
}));

const prismaMock = vi.hoisted(() => ({
  findFirst: vi.fn(),
  update: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: () => {} }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: state.authUser }, error: state.authError }),
      signInWithPassword: async () => ({ data: { user: state.authUser }, error: state.authError }),
      signOut: async () => ({ error: null }),
    },
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findFirst: prismaMock.findFirst, update: prismaMock.update } },
}));

import {
  JUDGE_ROLES,
  OPERATOR_ROLES,
  SCORING_ROLES,
  getSessionUser,
  requireSessionUser,
} from "@/lib/auth/session";

const appUser = {
  id: "USR-1",
  authUserId: "AUTH-1",
  email: "operator@pagar.id",
  name: "Operator",
  role: "OPERATOR" as const,
};

beforeEach(() => {
  state.authUser = { id: "AUTH-1", email: "operator@pagar.id" };
  state.authError = null;
  prismaMock.findFirst.mockReset();
  prismaMock.update.mockReset();
});

describe("getSessionUser", () => {
  it("returns null when Supabase has no session", async () => {
    state.authUser = null;

    await expect(getSessionUser()).resolves.toBeNull();
    expect(prismaMock.findFirst).not.toHaveBeenCalled();
  });

  it("returns null when the session is invalid", async () => {
    state.authError = { message: "invalid token" };

    await expect(getSessionUser()).resolves.toBeNull();
  });

  it("returns null when the identity is not an active app user", async () => {
    prismaMock.findFirst.mockResolvedValue(null);

    await expect(getSessionUser()).resolves.toBeNull();
  });

  it("reads the role from public.users, never from Supabase metadata", async () => {
    prismaMock.findFirst.mockResolvedValue(appUser);

    const user = await getSessionUser();

    expect(user).toEqual({
      id: "USR-1",
      authUserId: "AUTH-1",
      email: "operator@pagar.id",
      name: "Operator",
      role: "OPERATOR",
    });
    expect(prismaMock.update).not.toHaveBeenCalled();
  });

  it("links the Supabase identity once when the user has no authUserId yet", async () => {
    prismaMock.findFirst.mockResolvedValue({ ...appUser, authUserId: null });
    prismaMock.update.mockResolvedValue({ ...appUser, authUserId: "AUTH-1" });

    const user = await getSessionUser();

    expect(prismaMock.update).toHaveBeenCalledWith({
      where: { id: "USR-1" },
      data: { authUserId: "AUTH-1" },
    });
    expect(user?.authUserId).toBe("AUTH-1");
  });
});

describe("requireSessionUser", () => {
  it("rejects a request without a session as 401", async () => {
    state.authUser = null;

    const failure = await requireSessionUser(OPERATOR_ROLES).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(UnauthorizedError);
    expect((failure as UnauthorizedError).status).toBe(401);
  });

  it("rejects a role outside the allow list as 403", async () => {
    prismaMock.findFirst.mockResolvedValue({ ...appUser, role: "JUDGE" });

    const failure = await requireSessionUser(OPERATOR_ROLES).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ForbiddenError);
    expect((failure as ForbiddenError).status).toBe(403);
  });

  it("accepts a role inside the allow list", async () => {
    prismaMock.findFirst.mockResolvedValue(appUser);

    await expect(requireSessionUser(OPERATOR_ROLES)).resolves.toMatchObject({
      id: "USR-1",
      role: "OPERATOR",
    });
  });

  it("lets an operator score through the scoring allow list", async () => {
    prismaMock.findFirst.mockResolvedValue(appUser);

    await expect(requireSessionUser(SCORING_ROLES)).resolves.toMatchObject({
      role: "OPERATOR",
    });
  });

  it("accepts a judge for the judge-only routes", async () => {
    state.authUser = { id: "AUTH-2", email: "juri1@pagar.id" };
    prismaMock.findFirst.mockResolvedValue({
      id: "USR-2",
      authUserId: "AUTH-2",
      email: "juri1@pagar.id",
      name: "Juri 1",
      role: "JUDGE" as const,
    });

    await expect(requireSessionUser(JUDGE_ROLES)).resolves.toMatchObject({
      role: "JUDGE",
    });
  });
});