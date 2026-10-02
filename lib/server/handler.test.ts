import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { NotFoundError, ValidationError } from "@/lib/server/errors";
import { actionError, parseBody, parseJson, withRouteHandler } from "@/lib/server/handler";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function brokenJsonRequest(): Request {
  return new Request("http://localhost/api/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{ not json",
  });
}

const payloadSchema = z.object({ name: z.string().min(1) });

const context = { params: Promise.resolve({ matchId: "MATCH-1" }) };

describe("withRouteHandler", () => {
  it("returns the payload with the default status", async () => {
    const handler = withRouteHandler(async () => ({ data: { ok: true } }));

    const response = await handler(jsonRequest({}), context);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("honours an explicit success status", async () => {
    const handler = withRouteHandler(async () => ({ data: { success: true }, status: 201 }));

    const response = await handler(jsonRequest({}), context);

    expect(response.status).toBe(201);
  });

  it("passes a Response through untouched", async () => {
    const custom = Response.json({ success: true }, { status: 200 });
    const handler = withRouteHandler(async () => custom);

    const response = await handler(jsonRequest({}), context);

    expect(response).toBe(custom);
  });

  it("maps a typed error to its status with a public message", async () => {
    const handler = withRouteHandler(async () => {
      throw new NotFoundError("Pertandingan tidak ditemukan.");
    });

    const response = await handler(jsonRequest({}), context);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Pertandingan tidak ditemukan.",
    });
  });

  it("hides internal details of a 500 and logs it instead", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = withRouteHandler(async () => {
      throw new Error("connection to 10.0.0.1 refused");
    });

    const response = await handler(jsonRequest({}), context);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Terjadi kesalahan pada server." });
    expect(JSON.stringify(body)).not.toContain("10.0.0.1");
    expect(logged).toHaveBeenCalledOnce();
    logged.mockRestore();
  });

  it("does not log client errors", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = withRouteHandler(async () => {
      throw new ValidationError("nama minimal 1 karakter.");
    });

    await handler(jsonRequest({}), context);

    expect(logged).not.toHaveBeenCalled();
    logged.mockRestore();
  });

  it("resolves the awaited params of the route context", async () => {
    const handler = withRouteHandler<{ matchId: string }, { matchId: string }>(
      async (_request, { params }) => ({ data: { matchId: (await params).matchId } })
    );

    const response = await handler(jsonRequest({}), context);

    await expect(response.json()).resolves.toEqual({ matchId: "MATCH-1" });
  });
});

describe("parseJson and parseBody", () => {
  it("parses a valid JSON body", async () => {
    await expect(parseJson(jsonRequest({ name: "Juri 1" }))).resolves.toEqual({
      name: "Juri 1",
    });
  });

  it("turns malformed JSON into a 400 ValidationError", async () => {
    await expect(parseJson(brokenJsonRequest())).rejects.toBeInstanceOf(ValidationError);
  });

  it("returns parsed, typed data for a valid body", async () => {
    await expect(parseBody(payloadSchema, jsonRequest({ name: "Juri 1" }))).resolves.toEqual({
      name: "Juri 1",
    });
  });

  it("throws the zod error for a body that violates the schema", async () => {
    await expect(parseBody(payloadSchema, jsonRequest({ name: "" }))).rejects.toBeInstanceOf(
      z.ZodError
    );
  });
});

describe("actionError", () => {
  it("converts an action failure into an error carrying the status", () => {
    const error = actionError({ status: 409, error: "Atlet sudah terdaftar." });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error & { status: number }).status).toBe(409);
    expect(error.message).toBe("Atlet sudah terdaftar.");
  });
});