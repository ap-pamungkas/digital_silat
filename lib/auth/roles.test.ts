import { describe, expect, it } from "vitest";
import { loginSchema } from "@/lib/validation";
import { initialsOf, roleLabel } from "@/lib/auth/roles";
import { ROLES } from "@/lib/types";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({ email: "operator@pagar.id", password: "rahasia123" });

    expect(result.success).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({ email: "operator", password: "rahasia123" });

    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = loginSchema.safeParse({ email: "operator@pagar.id", password: "pendek" });

    expect(result.success).toBe(false);
  });

  it("rejects a missing field", () => {
    expect(loginSchema.safeParse({ email: "operator@pagar.id" }).success).toBe(false);
    expect(loginSchema.safeParse({ password: "rahasia123" }).success).toBe(false);
  });
});

describe("roleLabel", () => {
  it("labels every role stored in the database", () => {
    for (const role of ROLES) {
      expect(roleLabel(role)).not.toBe("");
      expect(roleLabel(role)).not.toBe(role);
    }
  });

  it("keeps a readable fallback for an unknown role", () => {
    expect(roleLabel("UNKNOWN" as never)).toBe("UNKNOWN");
  });
});

describe("initialsOf", () => {
  it("uses the first letter of the first and last name", () => {
    expect(initialsOf("Agustinusauw")).toBe("AG");
    expect(initialsOf("Budi Santoso")).toBe("BS");
    expect(initialsOf("Agustinus Wibowo")).toBe("AW");
  });

  it("falls back to the two first letters of a single name", () => {
    expect(initialsOf("judip")).toBe("JU");
  });

  it("never returns an empty badge", () => {
    expect(initialsOf("   ")).toBe("?");
  });
});