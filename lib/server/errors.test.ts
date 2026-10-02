import { describe, expect, it } from "vitest";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  toPublicMessage,
  toStatus,
} from "@/lib/server/errors";

describe("toStatus", () => {
  it("uses the status carried by the typed errors", () => {
    expect(toStatus(new ValidationError("bad"))).toBe(400);
    expect(toStatus(new UnauthorizedError("no"))).toBe(401);
    expect(toStatus(new NotFoundError("gone"))).toBe(404);
    expect(toStatus(new ConflictError("clash"))).toBe(409);
  });

  it("reads a plain status property from action failures", () => {
    expect(toStatus(Object.assign(new Error("x"), { status: 409 }))).toBe(409);
  });

  it("falls back to 500 for anything unrecognised", () => {
    expect(toStatus(new Error("boom"))).toBe(500);
    expect(toStatus("boom")).toBe(500);
    expect(toStatus(null)).toBe(500);
    expect(toStatus(undefined)).toBe(500);
    expect(toStatus({ status: "404" })).toBe(500);
  });
});

describe("toPublicMessage", () => {
  it("passes the real message through for client errors", () => {
    expect(toPublicMessage(new NotFoundError("Atlet tidak ditemukan."), 404)).toBe(
      "Atlet tidak ditemukan."
    );
  });

  it("never leaks the detail of a server error", () => {
    const internal = new Error("PrismaClientKnownRequestError: connection refused");

    expect(toPublicMessage(internal, 500)).toBe("Terjadi kesalahan pada server.");
    expect(toPublicMessage(internal, 503)).toBe("Terjadi kesalahan pada server.");
  });

  it("falls back to the status message when no message is available", () => {
    expect(toPublicMessage(new Error(""), 404)).toBe("Data tidak ditemukan.");
    expect(toPublicMessage("bukan error", 400)).toBe("Permintaan tidak valid.");
  });

  it("falls back to a generic message for unmapped statuses", () => {
    expect(toPublicMessage(new Error(""), 418)).toBe("Permintaan tidak valid.");
    expect(toPublicMessage(new Error(""), 403)).toBe("Permintaan tidak valid.");
  });
});

describe("error classes", () => {
  it("keeps the error name for logging while exposing a friendly status", () => {
    const error = new ValidationError("nama tidak valid.");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ValidationError");
    expect(error.status).toBe(400);
  });
});