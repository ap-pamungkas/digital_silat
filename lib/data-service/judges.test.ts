import { beforeEach, describe, expect, it, vi } from "vitest";
import { getJudges } from "./judges";

const state = vi.hoisted(() => ({
  judges: [] as Array<{
    id: string;
    judgeNumber: number;
    name: string;
    licenseNumber: string | null;
    status: "ONLINE" | "OFFLINE";
    batteryLevel: number | null;
    pingMs: number | null;
    device: string | null;
    lastActiveAt: Date;
    arena: { arenaCode: string; arenaNumber: number; tournamentId: string };
  }>,
  updatedStale: [] as string[],
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    tournament: {
      findFirst: async () => ({ id: "TOUR-1" }),
      findMany: async () => [],
    },
    judge: {
      findMany: async () => state.judges,
      updateMany: async (args: { where: { id: { in: string[] } }; data: { status: string } }) => {
        state.updatedStale.push(...args.where.id.in);
        return { count: args.where.id.in.length };
      },
    },
  },
}));

vi.mock("./tournaments", () => ({
  syncTournamentStatuses: async () => {},
}));

describe("getJudges heartbeat evaluation", () => {
  beforeEach(() => {
    state.updatedStale = [];
  });

  it("marks a judge with stale heartbeat (e.g. from 3 days ago) as OFFLINE and updates DB", async () => {
    const staleDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago (5 Oct when today is 8 Oct)
    const freshDate = new Date(); // Active now

    state.judges = [
      {
        id: "J-STALE",
        judgeNumber: 1,
        name: "Juri Stale",
        licenseNumber: null,
        status: "ONLINE", // Still ONLINE in DB from 5 Oct
        batteryLevel: 80,
        pingMs: 25,
        device: "Tablet 1",
        lastActiveAt: staleDate,
        arena: { arenaCode: "ARENA-01", arenaNumber: 1, tournamentId: "TOUR-1" },
      },
      {
        id: "J-ACTIVE",
        judgeNumber: 2,
        name: "Juri Active",
        licenseNumber: null,
        status: "ONLINE",
        batteryLevel: 95,
        pingMs: 15,
        device: "Tablet 2",
        lastActiveAt: freshDate,
        arena: { arenaCode: "ARENA-01", arenaNumber: 1, tournamentId: "TOUR-1" },
      },
    ];

    const result = await getJudges();

    const staleJudge = result.find((j) => j.id === "J-STALE");
    const activeJudge = result.find((j) => j.id === "J-ACTIVE");

    expect(staleJudge?.status).toBe("OFFLINE");
    expect(activeJudge?.status).toBe("ONLINE");
    expect(state.updatedStale).toContain("J-STALE");
    expect(state.updatedStale).not.toContain("J-ACTIVE");
  });
});
