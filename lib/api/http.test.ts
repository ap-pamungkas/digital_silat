import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, http } from "@/lib/api/http";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

function jsonResponse(body: unknown, status = 200) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
    json: async () => JSON.parse(text),
  };
}

describe("http.get", () => {
  it("resolves the parsed JSON body on success", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [1, 2] }));

    await expect(http.get("/api/matches")).resolves.toEqual({ data: [1, 2] });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/matches",
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("http.post", () => {
  it("sends the body as JSON with a content type", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { success: true } }));

    await http.post("/api/auth/login", { email: "a@b.id", password: "rahasiaaa" });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.method).toBe("POST");
    expect(new Headers(options.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(options.body as string)).toEqual({
      email: "a@b.id",
      password: "rahasiaaa",
    });
  });
});

describe("error mapping", () => {
  it("uses the server { error } message and keeps the status", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Kode akses tidak valid." }, 401));

    const failure = await http.get("/api/judge-sessions/me").catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).message).toBe("Kode akses tidak valid.");
    expect((failure as ApiError).status).toBe(401);
    expect((failure as ApiError).data).toEqual({ error: "Kode akses tidak valid." });
  });

  it("falls back to the { message } field", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Gagal memuat." }, 500));

    const failure = await http.get("/api/x").catch((e: unknown) => e);
    expect((failure as ApiError).message).toBe("Gagal memuat.");
    expect((failure as ApiError).status).toBe(500);
  });

  it("uses a raw text body when it is not JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse("upstream down", 502));

    const failure = await http.get("/api/x").catch((e: unknown) => e);
    expect((failure as ApiError).message).toBe("upstream down");
  });

  it("builds a default message when the body is empty", async () => {
    fetchMock.mockResolvedValue(jsonResponse("", 503));

    const failure = await http.get("/api/x").catch((e: unknown) => e);
    expect((failure as ApiError).message).toBe(
      "Request to /api/x failed with status 503"
    );
  });
});
