import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/server/errors";
import { firstIssueMessage, toValidationError } from "@/lib/server/validate";
import {
  createJudgeSchema,
  updateJudgeSchema,
  updateTournamentSchema,
  verifyJudgeSessionSchema,
} from "@/lib/validation";

describe("firstIssueMessage", () => {
  it("names the field in Indonesian", () => {
    const result = createJudgeSchema.safeParse({ arenaId: "", judgeNumber: 1, name: "Juri" });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(firstIssueMessage(result.error)).toBe("gelanggang minimal 1 karakter.");
  });

  it("reports the limit when a number is out of range", () => {
    const result = createJudgeSchema.safeParse({
      arenaId: "ARENA-01",
      judgeNumber: 9,
      name: "Juri",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(firstIssueMessage(result.error)).toBe("nomor juri maksimal 5.");
  });

  it("reports an unknown enum member as unrecognised", () => {
    const result = updateJudgeSchema.safeParse({ status: "TERPUTUS" });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(firstIssueMessage(result.error)).toBe("status tidak dikenali.");
  });

  it("reports a wrong type instead of a length rule", () => {
    const result = createJudgeSchema.safeParse({
      arenaId: "ARENA-01",
      judgeNumber: 1,
      name: 42,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(firstIssueMessage(result.error)).toBe("nama tidak valid.");
  });

  it("drops unknown keys, so a typo-only payload is reported as an empty patch", () => {
    const result = updateTournamentSchema.safeParse({ namaTurnamen: "x" });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(firstIssueMessage(result.error)).toBe("Tidak ada perubahan yang dikirim.");
  });

  it("surfaces the custom refine message for an empty patch", () => {
    const result = updateTournamentSchema.safeParse({});

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(firstIssueMessage(result.error)).toBe("Tidak ada perubahan yang dikirim.");
  });

  it("keeps a safe fallback when the issue list is empty", () => {
    expect(firstIssueMessage({ issues: [] } as never)).toBe("Permintaan tidak valid.");
  });
});

describe("toValidationError", () => {
  it("converts a zod error into a 400 ValidationError with the first issue", () => {
    const result = verifyJudgeSessionSchema.safeParse({
      matchId: "MATCH-1",
      judgeNumber: 1,
      accessCode: "bukan-kode",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const error = toValidationError(result.error);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.status).toBe(400);
    expect(error.message).toBe("kode akses tidak valid.");
  });

  it("still returns a ValidationError for a non-zod error", () => {
    const error = toValidationError(new Error("internal detail"));

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe("Permintaan tidak valid.");
    expect(error.message).not.toContain("internal detail");
  });
});