import { describe, expect, it } from "vitest";
import { loginSchema } from "@/lib/validation/auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "operator1@pagar.id",
      password: "rahasia-kuat",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email in Indonesian", () => {
    const result = loginSchema.safeParse({
      email: "bukan-email",
      password: "rahasia-kuat",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("email tidak valid.");
    }
  });

  it("rejects a password shorter than 8 characters in Indonesian", () => {
    const result = loginSchema.safeParse({
      email: "operator1@pagar.id",
      password: "pendek",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("kata sandi minimal 8 karakter.");
    }
  });

  it("rejects missing fields", () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
    expect(
      loginSchema.safeParse({ email: "operator1@pagar.id" }).success
    ).toBe(false);
  });
});
