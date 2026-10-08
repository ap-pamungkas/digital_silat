import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/server/errors";

interface TxCall {
  where?: unknown;
  data?: unknown;
}

const state = vi.hoisted(() => ({
  matchRow: null as null | {
    id: string;
    arenaId: string;
    status: string;
    currentRound: number;
    timeRemainingSeconds: number;
    timerStatus: string;
    timerLastStartedAt: Date | null;
    redScore: number;
    blueScore: number;
  },
  judgeRow: null as null | { id: string },
  judgeCount: 3 as number,
  recent: [] as Array<{ id?: string; judgeNumber: number; status?: string }>,
  target: null as null | {
    id: string;
    matchId: string;
    round: number;
    corner: "RED" | "BLUE";
    action: "PUKULAN";
    status: "PENDING" | "VERIFIED";
    points: number;
    judgeNumber: number;
    createdAt: Date;
  },
  peers: [] as Array<{ id: string; judgeNumber: number }>,
  updateManyCount: 1,
  snapshotRow: null as null | {
    id: string;
    redScore: number;
    blueScore: number;
    scoreEvents: never[];
    penalties: never[];
  },
  created: [] as TxCall[],
  audits: [] as TxCall[],
  penalties: [] as TxCall[],
  matchUpdates: [] as TxCall[],
  eventUpdates: [] as TxCall[],
}));

const tx = {
  match: {
    findUnique: async () => state.matchRow,
    update: async (args: TxCall) => {
      state.matchUpdates.push(args);
      return {};
    },
  },
  judge: {
    findUnique: async () => state.judgeRow,
    count: async () => state.judgeCount,
    update: async () => ({}),
  },
  scoreEvent: {
    findMany: async (args: { select?: Record<string, boolean>; where?: { createdAt?: Record<string, unknown> } }) => {
      if (args.where?.createdAt && "lte" in args.where.createdAt) return state.peers;
      return state.recent;
    },
    findFirst: async () => state.target,
    create: async (args: TxCall) => {
      state.created.push(args);
      return { id: "EVT-NEW" };
    },
    updateMany: async (args: TxCall) => {
      state.eventUpdates.push(args);
      return { count: state.updateManyCount };
    },
  },
  penalty: {
    create: async (args: TxCall) => {
      state.penalties.push(args);
      return { id: "PEN-1" };
    },
  },
  auditLog: {
    create: async (args: TxCall) => {
      state.audits.push(args);
      return {};
    },
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx),
    match: {
      findUnique: async (args: { select?: Record<string, boolean> }) =>
        args.select && "scoreEvents" in args.select ? state.snapshotRow : state.matchRow,
    },
  },
}));

import {
  applyPenaltyAction,
  decideScoreEventAction,
  submitScoreEventAction,
} from "@/lib/data-service/scoring";

function liveMatch() {
  return {
    id: "M-1",
    arenaId: "A-1",
    status: "IN_PROGRESS",
    currentRound: 1,
    timeRemainingSeconds: 120,
    timerStatus: "READY",
    timerLastStartedAt: null,
    redScore: 0,
    blueScore: 0,
  };
}

beforeEach(() => {
  state.matchRow = liveMatch();
  state.judgeRow = { id: "J-1" };
  state.judgeCount = 3;
  state.recent = [];
  state.target = null;
  state.peers = [];
  state.updateManyCount = 1;
  state.snapshotRow = { id: "M-1", redScore: 0, blueScore: 0, scoreEvents: [], penalties: [] };
  state.created = [];
  state.audits = [];
  state.penalties = [];
  state.matchUpdates = [];
  state.eventUpdates = [];
});

describe("submitScoreEventAction", () => {
  it("rejects points that do not match the action table", async () => {
    const error = await submitScoreEventAction({
      matchId: "M-1",
      corner: "RED",
      action: "PUKULAN",
      points: 2,
      judgeNumber: 1,
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as Error).message).toBe("Jenis serangan atau nilai poin tidak valid.");
    expect(state.created).toHaveLength(0);
  });

  it("rejects a judge number outside 1..5", async () => {
    const error = await submitScoreEventAction({
      matchId: "M-1",
      corner: "RED",
      action: "PUKULAN",
      points: 1,
      judgeNumber: 6,
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as Error).message).toBe("Nomor juri tidak valid.");
  });

  it("rejects scoring on a finished match", async () => {
    if (state.matchRow) state.matchRow.status = "FINISHED";

    const error = await submitScoreEventAction({
      matchId: "M-1",
      corner: "RED",
      action: "PUKULAN",
      points: 1,
      judgeNumber: 1,
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictError);
    expect(state.created).toHaveLength(0);
  });

  it("rejects an unknown match", async () => {
    state.matchRow = null;

    const error = await submitScoreEventAction({
      matchId: "M-9",
      corner: "RED",
      action: "PUKULAN",
      points: 1,
      judgeNumber: 1,
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(NotFoundError);
  });

  it("rejects a judge that is not registered on the arena", async () => {
    state.judgeRow = null;

    const error = await submitScoreEventAction({
      matchId: "M-1",
      corner: "BLUE",
      action: "TENDANGAN",
      points: 2,
      judgeNumber: 3,
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as Error).message).toBe(
      "Juri belum terdaftar pada gelanggang pertandingan ini."
    );
  });

  it("records the event as PENDING when quorum is not yet reached", async () => {
    state.recent = [];

    const result = await submitScoreEventAction({
      matchId: "M-1",
      corner: "RED",
      action: "PUKULAN",
      points: 1,
      judgeNumber: 1,
    });

    expect(result.agreedJudges).toEqual([1]);
    expect(state.created).toHaveLength(1);
    expect(state.created[0]?.data).toMatchObject({
      status: "PENDING",
      verified: false,
    });
    expect(state.matchUpdates).toHaveLength(0);
    expect(state.audits).toHaveLength(1);
    expect(state.audits[0]?.data).toMatchObject({ action: "SCORE_SUBMITTED" });
    expect(result.snapshot.matchId).toBe("M-1");
  });

  it("auto-verifies the event and awards points when quorum is reached (2 of 3 judges)", async () => {
    state.judgeCount = 3;
    state.recent = [{ id: "EVT-PEER", judgeNumber: 2, status: "PENDING" }];

    const result = await submitScoreEventAction({
      matchId: "M-1",
      corner: "RED",
      action: "PUKULAN",
      points: 1,
      judgeNumber: 1,
    });

    expect(result.agreedJudges).toEqual([1, 2]);
    expect(state.created).toHaveLength(1);
    expect(state.created[0]?.data).toMatchObject({
      status: "VERIFIED",
      verified: true,
    });
    expect(state.eventUpdates).toHaveLength(1);
    expect(state.matchUpdates).toHaveLength(1);
    expect(state.matchUpdates[0]?.data).toEqual({ redScore: 1 });
    expect(state.audits).toHaveLength(1);
    expect(state.audits[0]?.data).toMatchObject({ action: "SCORE_AUTO_VERIFIED" });
  });

  it("requires 3 judges when arena has 5 judges", async () => {
    state.judgeCount = 5;
    // 1 peer exists -> total 2 judges -> still PENDING (needs 3)
    state.recent = [{ id: "EVT-1", judgeNumber: 2, status: "PENDING" }];

    const result1 = await submitScoreEventAction({
      matchId: "M-1",
      corner: "RED",
      action: "PUKULAN",
      points: 1,
      judgeNumber: 1,
    });

    expect(result1.agreedJudges).toEqual([1, 2]);
    expect(state.created[0]?.data).toMatchObject({ status: "PENDING", verified: false });
    expect(state.matchUpdates).toHaveLength(0);

    // 2 peers exist -> judge 3 votes -> total 3 judges -> QUORUM AUTO-VERIFIED!
    state.recent = [
      { id: "EVT-1", judgeNumber: 1, status: "PENDING" },
      { id: "EVT-2", judgeNumber: 2, status: "PENDING" },
    ];
    const result2 = await submitScoreEventAction({
      matchId: "M-1",
      corner: "RED",
      action: "PUKULAN",
      points: 1,
      judgeNumber: 3,
    });

    expect(result2.agreedJudges).toEqual([1, 2, 3]);
    expect(state.created[1]?.data).toMatchObject({ status: "VERIFIED", verified: true });
    expect(state.matchUpdates).toHaveLength(1);
    expect(state.matchUpdates[0]?.data).toEqual({ redScore: 1 });
  });

  it("requires 3 judges when arena has 4 judges (3-dari-4 quorum)", async () => {
    state.judgeCount = 4;
    state.recent = [
      { id: "EVT-1", judgeNumber: 2, status: "PENDING" },
      { id: "EVT-2", judgeNumber: 3, status: "PENDING" },
    ];

    const result = await submitScoreEventAction({
      matchId: "M-1",
      corner: "RED",
      action: "PUKULAN",
      points: 1,
      judgeNumber: 4,
    });

    expect(result.agreedJudges).toEqual([2, 3, 4]);
    expect(state.created[0]?.data).toMatchObject({ status: "VERIFIED", verified: true });
    expect(state.eventUpdates).toHaveLength(1);
    expect(state.matchUpdates).toHaveLength(1);
    expect(state.matchUpdates[0]?.data).toEqual({ redScore: 1 });
    expect(state.audits[0]?.data).toMatchObject({
      action: "SCORE_AUTO_VERIFIED",
      details: expect.stringContaining('"quorumRequired":3'),
    });
  });

  it("does not add duplicate points when another judge agrees on an already-verified event", async () => {
    state.judgeCount = 5;
    state.recent = [
      { id: "EVT-1", judgeNumber: 1, status: "VERIFIED" },
      { id: "EVT-2", judgeNumber: 2, status: "VERIFIED" },
      { id: "EVT-3", judgeNumber: 3, status: "VERIFIED" },
    ];

    const result = await submitScoreEventAction({
      matchId: "M-1",
      corner: "RED",
      action: "PUKULAN",
      points: 1,
      judgeNumber: 4,
    });

    expect(result.agreedJudges).toEqual([1, 2, 3, 4]);
    expect(state.created[0]?.data).toMatchObject({ status: "VERIFIED", verified: true });
    expect(state.matchUpdates).toHaveLength(0);
    expect(state.audits[0]?.data).toMatchObject({ action: "SCORE_SUBMITTED" });
  });

  it("is idempotent when the same judge votes twice in the window", async () => {
    state.recent = [{ judgeNumber: 1 }];

    const result = await submitScoreEventAction({
      matchId: "M-1",
      corner: "RED",
      action: "PUKULAN",
      points: 1,
      judgeNumber: 1,
    });

    expect(result.agreedJudges).toEqual([1]);
    expect(state.created).toHaveLength(0);
    expect(state.audits).toHaveLength(0);
  });
});

describe("decideScoreEventAction", () => {
  function pendingTarget() {
    state.target = {
      id: "E-1",
      matchId: "M-1",
      round: 1,
      corner: "RED",
      action: "PUKULAN",
      status: "PENDING",
      points: 1,
      judgeNumber: 1,
      createdAt: new Date("2026-10-02T10:00:00.000Z"),
    };
  }

  it("verifies a quorum group and applies the points", async () => {
    pendingTarget();
    state.peers = [
      { id: "E-1", judgeNumber: 1 },
      { id: "E-2", judgeNumber: 2 },
      { id: "E-3", judgeNumber: 3 },
    ];

    await decideScoreEventAction({ matchId: "M-1", eventId: "E-1", decision: "VERIFY" });

    expect(state.eventUpdates[0]?.data).toMatchObject({
      status: "VERIFIED",
      verified: true,
    });
    expect(state.matchUpdates).toHaveLength(1);
    expect(state.matchUpdates[0]?.data).toEqual({ redScore: 1 });
    expect(state.audits[0]?.data).toMatchObject({ action: "SCORE_VERIFIED" });
  });

  it("refuses to verify a single judge without quorum", async () => {
    pendingTarget();
    state.peers = [{ id: "E-1", judgeNumber: 1 }];

    const error = await decideScoreEventAction({
      matchId: "M-1",
      eventId: "E-1",
      decision: "VERIFY",
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictError);
    expect((error as Error).message).toBe("Dibutuhkan minimal 2 juri untuk mengesahkan poin.");
    expect(state.eventUpdates).toHaveLength(0);
    expect(state.matchUpdates).toHaveLength(0);
  });

  it("rejects a verified event and removes the points", async () => {
    pendingTarget();
    if (state.target) {
      state.target.status = "VERIFIED";
      state.target.corner = "BLUE";
      state.target.points = 3;
    }
    if (state.matchRow) state.matchRow.blueScore = 5;
    state.peers = [{ id: "E-1", judgeNumber: 1 }];

    await decideScoreEventAction({ matchId: "M-1", eventId: "E-1", decision: "REJECT" });

    expect(state.eventUpdates[0]?.data).toMatchObject({
      status: "REJECTED",
      verified: false,
    });
    expect(state.matchUpdates[0]?.data).toEqual({ blueScore: 2 });
    expect(state.audits[0]?.data).toMatchObject({ action: "SCORE_REJECTED" });
  });
});

describe("applyPenaltyAction", () => {
  it("deducts the server-authoritative points from the corner", async () => {
    if (state.matchRow) state.matchRow.redScore = 3;

    const result = await applyPenaltyAction({
      matchId: "M-1",
      corner: "RED",
      type: "TEGURAN_1",
    });

    expect(result.penaltyId).toBe("PEN-1");
    expect(state.penalties[0]?.data).toMatchObject({
      corner: "RED",
      type: "TEGURAN_1",
      pointsDeducted: 1,
    });
    expect(state.matchUpdates[0]?.data).toEqual({ redScore: 2 });
    expect(state.audits[0]?.data).toMatchObject({ action: "PENALTY_APPLIED" });
  });

  it("never drives a score below zero", async () => {
    await applyPenaltyAction({ matchId: "M-1", corner: "BLUE", type: "PERINGATAN_2" });

    expect(state.matchUpdates[0]?.data).toEqual({ blueScore: 0 });
  });

  it("rejects penalties on a finished match", async () => {
    if (state.matchRow) state.matchRow.status = "FINISHED";

    const error = await applyPenaltyAction({
      matchId: "M-1",
      corner: "RED",
      type: "TEGURAN_1",
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictError);
    expect(state.penalties).toHaveLength(0);
  });
});
