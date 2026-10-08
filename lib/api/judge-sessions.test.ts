import { describe, expect, it, vi } from "vitest";
import { http } from "./http";
import { judgeSessionsApi } from "./judge-sessions";

vi.mock("./http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("judgeSessionsApi", () => {
  it("unwraps verify response when server returns flat result", async () => {
    vi.mocked(http.post).mockResolvedValueOnce({
      success: true,
      matchId: "M-TEST-01",
      judgeNumber: 1,
      judgeName: "TEST JURI 1",
      matchNumber: "MATCH #TEST-01",
      arenaName: "GELANGGANG 1",
    });

    const result = await judgeSessionsApi.verify({
      accessCode: "A1B2C3D4E5F67890",
      judgeNumber: 1,
    });

    expect(result.matchId).toBe("M-TEST-01");
    expect(result.judgeNumber).toBe(1);
    expect(result.judgeName).toBe("TEST JURI 1");
  });

  it("defensively unwraps verify response when server returns nested data", async () => {
    vi.mocked(http.post).mockResolvedValueOnce({
      data: {
        success: true,
        matchId: "M-TEST-01",
        judgeNumber: 2,
        judgeName: "TEST JURI 2",
        matchNumber: "MATCH #TEST-01",
        arenaName: "GELANGGANG 1",
      },
    });

    const result = await judgeSessionsApi.verify({
      accessCode: "A1B2C3D4E5F67890",
      judgeNumber: 2,
    });

    expect(result.matchId).toBe("M-TEST-01");
    expect(result.judgeNumber).toBe(2);
    expect(result.judgeName).toBe("TEST JURI 2");
  });

  it("unwraps me response cleanly", async () => {
    vi.mocked(http.get).mockResolvedValueOnce({
      matchId: "M-TEST-01",
      judgeId: "J-1",
      judgeNumber: 1,
      judgeName: "TEST JURI 1",
    });

    const session = await judgeSessionsApi.me();
    expect(session.matchId).toBe("M-TEST-01");
    expect(session.judgeNumber).toBe(1);
  });
});
