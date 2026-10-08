import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateMatchStatusAction, getMatches } from "./matches";

interface MockMatchRow {
  id: string;
  matchNumber: string;
  status: string;
  startedAt?: Date | null;
  endedAt?: Date | null;
  winnerCorner?: string | null;
  winnerAthleteId?: string | null;
  winReason?: string | null;
  timerStatus?: string;
  timeRemainingSeconds?: number;
  timerLastStartedAt?: Date | null;
  currentRound?: number;
  totalRounds?: number;
  roundDurationSeconds?: number;
  redScore?: number;
  blueScore?: number;
  arenaId?: string;
  categoryId?: string;
  stage?: string;
  scheduledDate?: Date;
  scheduledTime?: Date | string | null;
  redAthleteId?: string;
  blueAthleteId?: string;
  redAthlete?: unknown;
  blueAthlete?: unknown;
  category?: unknown;
  tournament?: unknown;
  arena?: unknown;
  scoreEvents?: unknown[];
  penalties?: unknown[];
}

interface MockAuditLog {
  matchId: string;
  action: string;
  details: string;
}

const state = vi.hoisted(() => ({
  matches: [] as MockMatchRow[],
  updatedMatch: null as (MockMatchRow & Record<string, unknown>) | null,
  auditLogs: [] as MockAuditLog[],
}));

vi.mock("@/lib/prisma", () => {
  const client = {
    match: {
      findMany: async () => state.matches,
      findUnique: async ({ where }: { where: { id: string } }) => {
        return state.matches.find((m) => m.id === where.id) || null;
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const existing = state.matches.find((m) => m.id === where.id) || { id: where.id, matchNumber: "", status: "" };
        state.updatedMatch = { ...existing, ...data };
        return state.updatedMatch;
      },
    },
    auditLog: {
      create: async ({ data }: { data: MockAuditLog }) => {
        state.auditLogs.push(data);
        return { id: "AUDIT-1", ...data };
      },
    },
  };

  return {
    prisma: {
      ...client,
      $transaction: async <T>(fn: (c: typeof client) => Promise<T>): Promise<T> => fn(client),
    },
  };
});

vi.mock("./tournaments", () => ({
  syncTournamentStatuses: async () => {},
}));

describe("updateMatchStatusAction", () => {
  beforeEach(() => {
    state.updatedMatch = null;
    state.auditLogs = [];
    state.matches = [
      {
        id: "MATCH-1",
        matchNumber: "MATCH #01",
        status: "SCHEDULED",
        startedAt: null,
        endedAt: null,
        redAthleteId: "ATH-RED",
        blueAthleteId: "ATH-BLUE",
        arena: { id: "ARENA-DB-1", arenaCode: "ARENA-01", name: "Gelanggang 1", judges: [] },
      },
    ];
  });

  it("transitions a match to LIVE and sets startedAt", async () => {
    const res = await updateMatchStatusAction({
      matchId: "MATCH-1",
      status: "LIVE",
    });

    expect(res.success).toBe(true);
    expect(state.updatedMatch?.status).toBe("LIVE");
    expect(state.updatedMatch?.startedAt).toBeInstanceOf(Date);
  });

  it("transitions a match to PAUSED", async () => {
    const res = await updateMatchStatusAction({
      matchId: "MATCH-1",
      status: "PAUSED",
    });

    expect(res.success).toBe(true);
    expect(state.updatedMatch?.status).toBe("PAUSED");
  });

  it("requires winnerCorner when transitioning to FINISHED", async () => {
    const res = await updateMatchStatusAction({
      matchId: "MATCH-1",
      status: "FINISHED",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("Pemenang partai wajib dipilih.");
    }
    expect(state.updatedMatch).toBeNull();
  });

  it("transitions to FINISHED with winner, ends timer, and records audit log", async () => {
    const res = await updateMatchStatusAction({
      matchId: "MATCH-1",
      status: "FINISHED",
      winnerCorner: "RED",
      winReason: "MENANG_ANGKA",
    });

    expect(res.success).toBe(true);
    expect(state.updatedMatch?.status).toBe("FINISHED");
    expect(state.updatedMatch?.winnerCorner).toBe("RED");
    expect(state.updatedMatch?.winnerAthleteId).toBe("ATH-RED");
    expect(state.updatedMatch?.timerStatus).toBe("FINISHED");
    expect(state.updatedMatch?.timeRemainingSeconds).toBe(0);
    expect(state.updatedMatch?.endedAt).toBeInstanceOf(Date);
    expect(state.auditLogs).toHaveLength(1);
    expect(state.auditLogs[0].action).toBe("MATCH_ENDED");
  });
});

describe("getMatches enrichment", () => {
  it("attaches arenaDbId, totalJudges, and dynamic minJudgesRequired", async () => {
    state.matches = [
      {
        id: "MATCH-10",
        matchNumber: "MATCH #10",
        status: "LIVE",
        redScore: 1,
        blueScore: 1,
        currentRound: 1,
        totalRounds: 3,
        roundDurationSeconds: 120,
        timeRemainingSeconds: 115,
        timerStatus: "RUNNING",
        timerLastStartedAt: new Date(),
        arenaId: "ARENA-DB-1",
        categoryId: "CAT-1",
        stage: "PENYISIHAN",
        winnerCorner: null,
        winReason: null,
        tournament: { code: "TOUR-1", name: "Turnamen 1" },
        scheduledDate: new Date("2026-10-08"),
        scheduledTime: new Date("2026-10-08T10:00:00Z"),
        redAthleteId: "ATH-1",
        blueAthleteId: "ATH-2",
        redAthlete: {
          id: "ATH-1",
          name: "Pesilat Merah",
          gender: "MALE",
          seed: null,
          category: { categoryClass: "A" },
          contingent: { name: "Kontingen A", code: "KNT-A" },
        },
        blueAthlete: {
          id: "ATH-2",
          name: "Pesilat Biru",
          gender: "MALE",
          seed: null,
          category: { categoryClass: "A" },
          contingent: { name: "Kontingen B", code: "KNT-B" },
        },
        category: { id: "CAT-1", name: "Tanding Putra A" },
        arena: {
          id: "ARENA-DB-1",
          arenaCode: "ARENA-01",
          arenaNumber: 1,
          name: "Gelanggang 1",
          judges: [{ id: "J1" }, { id: "J2" }, { id: "J3" }, { id: "J4" }],
        },
        scoreEvents: [],
        penalties: [],
      },
    ];

    const result = await getMatches();
    expect(result).toHaveLength(1);
    expect(result[0].arenaDbId).toBe("ARENA-DB-1");
    expect(result[0].totalJudges).toBe(4);
    // For 4 judges, quorum is 3
    expect(result[0].minJudgesRequired).toBe(3);
  });
});
