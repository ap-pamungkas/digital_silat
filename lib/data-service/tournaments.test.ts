import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveTournamentStatus, syncTournamentStatuses } from "./tournaments";

const state = vi.hoisted(() => ({
  tournaments: [] as Array<{
    id: string;
    startDate: Date;
    endDate: Date;
    status: "UPCOMING" | "ONGOING" | "COMPLETED" | "ARCHIVED";
  }>,
  updates: [] as Array<{ where: { id: string }; data: { status: string } }>,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    tournament: {
      findMany: async () => state.tournaments,
      update: (args: { where: { id: string }; data: { status: string } }) => {
        state.updates.push(args);
        return Promise.resolve(args);
      },
    },
    $transaction: async (ops: unknown[]) => Promise.all(ops),
    athlete: {
      count: async () => 0,
    },
  },
}));

describe("resolveTournamentStatus", () => {
  const refDate = new Date("2026-10-08T12:00:00.000Z");

  it("resolves to ONGOING when today is between start and end date (e.g. KEJURDA KTG 4-30 Okt 2026)", () => {
    const start = new Date("2026-10-04T00:00:00.000Z");
    const end = new Date("2026-10-30T23:59:59.000Z");

    const status = resolveTournamentStatus(start, end, "UPCOMING", refDate);
    expect(status).toBe("ONGOING");
  });

  it("resolves to COMPLETED when tournament ended on or before today (e.g. Test tournament ended 4 Okt 2026)", () => {
    const start = new Date("2026-10-01T00:00:00.000Z");
    const end = new Date("2026-10-04T18:00:00.000Z");

    const status = resolveTournamentStatus(start, end, "UPCOMING", refDate);
    expect(status).toBe("COMPLETED");
  });

  it("resolves to UPCOMING when start date is in the future", () => {
    const start = new Date("2026-10-15T08:00:00.000Z");
    const end = new Date("2026-10-20T18:00:00.000Z");

    const status = resolveTournamentStatus(start, end, "UPCOMING", refDate);
    expect(status).toBe("UPCOMING");
  });

  it("preserves ARCHIVED status regardless of dates", () => {
    const start = new Date("2026-10-04T00:00:00.000Z");
    const end = new Date("2026-10-30T23:59:59.000Z");

    const status = resolveTournamentStatus(start, end, "ARCHIVED", refDate);
    expect(status).toBe("ARCHIVED");
  });
});

describe("syncTournamentStatuses", () => {
  beforeEach(() => {
    state.updates = [];
  });

  it("syncs drifted tournament statuses in the database", async () => {
    state.tournaments = [
      {
        id: "T-KEJURDA",
        startDate: new Date("2026-10-04T00:00:00.000Z"),
        endDate: new Date("2026-10-30T23:59:59.000Z"),
        status: "UPCOMING", // Drifted, should be ONGOING on 8 Oct
      },
      {
        id: "T-TEST",
        startDate: new Date("2026-10-01T00:00:00.000Z"),
        endDate: new Date("2026-10-04T23:59:59.000Z"),
        status: "UPCOMING", // Drifted, should be COMPLETED on 8 Oct
      },
      {
        id: "T-FUTURE",
        startDate: new Date("2026-12-01T00:00:00.000Z"),
        endDate: new Date("2026-12-05T23:59:59.000Z"),
        status: "UPCOMING", // Correct
      },
    ];

    await syncTournamentStatuses();

    expect(state.updates).toHaveLength(2);
    expect(state.updates).toContainEqual({
      where: { id: "T-KEJURDA" },
      data: { status: "ONGOING" },
    });
    expect(state.updates).toContainEqual({
      where: { id: "T-TEST" },
      data: { status: "COMPLETED" },
    });
  });
});
