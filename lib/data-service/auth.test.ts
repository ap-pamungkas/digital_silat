import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/lib/server/errors";

const state = vi.hoisted(() => ({
  configured: true,
  signInResult: null as null | {
    data: { user: { id: string; email?: string } | null };
    error: { message: string } | null;
  },
  sessionUser: null as null | { id: string },
  appUser: null as null | {
    id: string;
    authUserId: string | null;
    email: string;
    name: string;
    role: "OPERATOR";
    isActive: boolean;
  },
}));

const supabaseMock = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  userFindFirst: vi.fn(),
  userUpdate: vi.fn(),
  auditCreate: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/session", () => ({
  isAuthConfigured: () => state.configured,
  createServerSupabaseClient: async () => ({
    auth: {
      signInWithPassword: supabaseMock.signInWithPassword,
      signOut: supabaseMock.signOut,
      getUser: supabaseMock.getUser,
    },
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findFirst: prismaMock.userFindFirst, update: prismaMock.userUpdate },
    auditLog: { create: prismaMock.auditCreate },
  },
}));

import { signInAction, signOutAction } from "@/lib/data-service/auth";

const supabaseUser = { id: "AUTH-1", email: "Operator1@Pagar.id" };

beforeEach(() => {
  state.configured = true;
  state.signInResult = { data: { user: supabaseUser }, error: null };
  state.sessionUser = null;
  state.appUser = {
    id: "USR-1",
    authUserId: null,
    email: "operator1@pagar.id",
    name: "Operator",
    role: "OPERATOR",
    isActive: true,
  };
  supabaseMock.signInWithPassword.mockReset().mockImplementation(async () => state.signInResult);
  supabaseMock.signOut.mockReset().mockResolvedValue({ error: null });
  supabaseMock.getUser.mockReset().mockImplementation(async () => ({
    data: { user: state.sessionUser },
  }));
  prismaMock.userFindFirst.mockReset().mockImplementation(async () => state.appUser);
  prismaMock.userUpdate.mockReset().mockImplementation(async (args: { data: unknown }) => ({
    ...state.appUser,
    ...(args.data as object),
  }));
  prismaMock.auditCreate.mockReset().mockResolvedValue({});
});

describe("signInAction", () => {
  it("refuses to run when auth is not configured", async () => {
    state.configured = false;

    const error = await signInAction("operator1@pagar.id", "rahasia-kuat").catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(supabaseMock.signInWithPassword).not.toHaveBeenCalled();
  });

  it("normalizes the email before calling Supabase", async () => {
    await signInAction("  Operator1@Pagar.id ", "rahasia-kuat");

    expect(supabaseMock.signInWithPassword).toHaveBeenCalledWith({
      email: "operator1@pagar.id",
      password: "rahasia-kuat",
    });
  });

  it("rejects a wrong password without touching the app users", async () => {
    state.signInResult = { data: { user: null }, error: { message: "bad" } };

    const error = await signInAction("operator1@pagar.id", "salah-salah").catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect((error as Error).message).toBe("Email atau kata sandi salah.");
    expect(prismaMock.userFindFirst).not.toHaveBeenCalled();
  });

  it("signs out and rejects an unknown app user", async () => {
    state.appUser = null;

    const error = await signInAction("asing@pagar.id", "rahasia-kuat").catch(
      (e: unknown) => e
    );
    expect((error as Error).message).toBe("Akun tidak terdaftar atau sudah dinonaktifkan.");
    expect(supabaseMock.signOut).toHaveBeenCalled();
  });

  it("signs out and rejects a deactivated app user", async () => {
    if (state.appUser) state.appUser.isActive = false;

    const error = await signInAction("operator1@pagar.id", "rahasia-kuat").catch(
      (e: unknown) => e
    );
    expect((error as Error).message).toBe("Akun tidak terdaftar atau sudah dinonaktifkan.");
    expect(supabaseMock.signOut).toHaveBeenCalled();
    expect(prismaMock.auditCreate).not.toHaveBeenCalled();
  });

  it("links the Supabase identity once and audits the login", async () => {
    const result = await signInAction("operator1@pagar.id", "rahasia-kuat");

    expect(prismaMock.userUpdate).toHaveBeenCalledWith({
      where: { id: "USR-1" },
      data: { authUserId: "AUTH-1" },
      select: expect.anything(),
    });
    expect(prismaMock.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: "USR-1", action: "LOGIN" }),
    });
    expect(result.user).toEqual({
      id: "USR-1",
      email: "operator1@pagar.id",
      name: "Operator",
      role: "OPERATOR",
    });
  });

  it("skips the update when the identity is already linked", async () => {
    if (state.appUser) state.appUser.authUserId = "AUTH-1";

    await signInAction("operator1@pagar.id", "rahasia-kuat");

    expect(prismaMock.userUpdate).not.toHaveBeenCalled();
    expect(prismaMock.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: "USR-1", action: "LOGIN" }),
    });
  });
});

describe("signOutAction", () => {
  it("audits the logout for a linked user", async () => {
    state.sessionUser = { id: "AUTH-1" };
    prismaMock.userFindFirst.mockResolvedValue({ id: "USR-1" });

    await signOutAction();

    expect(supabaseMock.signOut).toHaveBeenCalled();
    expect(prismaMock.auditCreate).toHaveBeenCalledWith({
      data: { userId: "USR-1", action: "LOGOUT", details: null },
    });
  });

  it("does not audit when there is no session user", async () => {
    await signOutAction();

    expect(supabaseMock.signOut).toHaveBeenCalled();
    expect(prismaMock.auditCreate).not.toHaveBeenCalled();
  });
});
