import { describe, expect, it } from "vitest";
import {
  createMatchSchema,
  createPenaltySchema,
  createTournamentSchema,
  decideScoreEventSchema,
  submitScoreEventSchema,
  updateMatchScheduleSchema,
  updateMatchStatusSchema,
  updateTimerSchema,
  updateTournamentSchema,
  verifyJudgeSessionSchema,
} from "@/lib/validation";

describe("createMatchSchema", () => {
  const valid = {
    arenaId: "ARENA-01",
    matchNumber: "M-01",
    redAthleteId: "ATH-RED",
    blueAthleteId: "ATH-BLUE",
  };

  it("accepts the minimum required fields", () => {
    const result = createMatchSchema.safeParse(valid);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.tournamentId).toBeUndefined();
    expect(result.data.stage).toBeUndefined();
  });

  it("rejects a blank arena or match number", () => {
    expect(createMatchSchema.safeParse({ ...valid, arenaId: "" }).success).toBe(false);
    expect(createMatchSchema.safeParse({ ...valid, matchNumber: "" }).success).toBe(false);
  });

  it("rejects an unknown stage and an unknown corner-agnostic type", () => {
    expect(createMatchSchema.safeParse({ ...valid, stage: "BABAK FINAL" }).success).toBe(false);
    expect(createMatchSchema.safeParse({ ...valid, scheduledDate: 20260101 }).success).toBe(false);
  });

  it("strips unknown keys instead of persisting them", () => {
    const result = createMatchSchema.safeParse({ ...valid, redScore: 9 });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect("redScore" in result.data).toBe(false);
  });
});

describe("updateMatchScheduleSchema", () => {
  it("requires every scheduling field", () => {
    expect(
      updateMatchScheduleSchema.safeParse({
        arenaId: "ARENA-01",
        matchNumber: "M-01",
        redAthleteId: "ATH-RED",
        blueAthleteId: "ATH-BLUE",
        stage: "FINAL",
        scheduledDate: "2026-01-01",
        scheduledTime: "19:00",
      }).success
    ).toBe(true);

    expect(updateMatchScheduleSchema.safeParse({ arenaId: "ARENA-01" }).success).toBe(false);
  });

  it("does not allow an optional stage", () => {
    expect(
      updateMatchScheduleSchema.safeParse({
        arenaId: "ARENA-01",
        matchNumber: "M-01",
        redAthleteId: "ATH-RED",
        blueAthleteId: "ATH-BLUE",
        scheduledDate: "2026-01-01",
        scheduledTime: "19:00",
      }).success
    ).toBe(false);
  });
});

describe("updateMatchStatusSchema", () => {
  it("accepts a status with a winner corner and win reason", () => {
    const result = updateMatchStatusSchema.safeParse({
      matchId: "MATCH-1",
      status: "FINISHED",
      winnerCorner: "BLUE",
      winReason: "MENANG_ANGKA",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a status transition without a winner", () => {
    const result = updateMatchStatusSchema.safeParse({ matchId: "MATCH-1", status: "LIVE" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.winnerCorner).toBeUndefined();
  });

  it("rejects a winner corner outside the two corners", () => {
    expect(
      updateMatchStatusSchema.safeParse({
        matchId: "MATCH-1",
        status: "FINISHED",
        winnerCorner: "GREEN",
      }).success
    ).toBe(false);
  });

  it("rejects an unknown win reason", () => {
    expect(
      updateMatchStatusSchema.safeParse({
        matchId: "MATCH-1",
        status: "FINISHED",
        winReason: "MENANG_KUTUK",
      }).success
    ).toBe(false);
  });
});

describe("submitScoreEventSchema", () => {
  const valid = {
    corner: "RED",
    action: "PUKULAN",
    points: 1,
    judgeNumber: 1,
  };

  it("accepts a well formed score submission", () => {
    expect(submitScoreEventSchema.safeParse(valid).success).toBe(true);
  });

  it("keeps the judge number inside the five judge slots", () => {
    expect(submitScoreEventSchema.safeParse({ ...valid, judgeNumber: 0 }).success).toBe(false);
    expect(submitScoreEventSchema.safeParse({ ...valid, judgeNumber: 6 }).success).toBe(false);
    expect(submitScoreEventSchema.safeParse({ ...valid, judgeNumber: 2.5 }).success).toBe(false);
  });

  it("rejects non-finite points", () => {
    expect(submitScoreEventSchema.safeParse({ ...valid, points: Number.NaN }).success).toBe(false);
    expect(
      submitScoreEventSchema.safeParse({ ...valid, points: Number.POSITIVE_INFINITY }).success
    ).toBe(false);
  });

  it("rejects an unknown scoring action", () => {
    expect(submitScoreEventSchema.safeParse({ ...valid, action: "JATUHAN_TEDAK" }).success).toBe(
      false
    );
  });

  it("allows HUKUMAN with zero points because it is not scoreable", () => {
    const result = submitScoreEventSchema.safeParse({ ...valid, action: "HUKUMAN", points: 0 });

    expect(result.success).toBe(true);
  });
});

describe("decideScoreEventSchema", () => {
  it("only allows VERIFY or REJECT", () => {
    expect(decideScoreEventSchema.safeParse({ decision: "VERIFY" }).success).toBe(true);
    expect(decideScoreEventSchema.safeParse({ decision: "REJECT" }).success).toBe(true);
    expect(decideScoreEventSchema.safeParse({ decision: "UNDO" }).success).toBe(false);
    expect(decideScoreEventSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateTimerSchema", () => {
  it("accepts timer actions that need no round", () => {
    expect(updateTimerSchema.safeParse({ action: "START" }).success).toBe(true);
    expect(updateTimerSchema.safeParse({ action: "NEXT_ROUND", round: 2 }).success).toBe(true);
  });

  it("requires a round for SET_ROUND and names the field", () => {
    const result = updateTimerSchema.safeParse({ action: "SET_ROUND" });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].path).toEqual(["round"]);
    expect(result.error.issues[0].message).toBe("Nomor babak wajib diisi untuk aksi SET_ROUND.");
  });

  it("rejects a non-integer round", () => {
    expect(updateTimerSchema.safeParse({ action: "NEXT_ROUND", round: 1.5 }).success).toBe(false);
  });

  it("rejects an unknown timer action", () => {
    expect(updateTimerSchema.safeParse({ action: "SKIP_ROUND" }).success).toBe(false);
  });
});

describe("createTournamentSchema", () => {
  it("requires a name and accepts the optional fields", () => {
    expect(createTournamentSchema.safeParse({ name: "Piala Nusantara" }).success).toBe(true);
    expect(
      createTournamentSchema.safeParse({
        name: "Piala Nusantara",
        location: "Jakarta",
        startDate: "2026-01-01",
        endDate: "2026-01-10",
        totalArenas: "3",
      }).success
    ).toBe(true);
    expect(createTournamentSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("updateTournamentSchema", () => {
  it("accepts a single field patch", () => {
    const result = updateTournamentSchema.safeParse({ status: "ONGOING" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual({ status: "ONGOING" });
  });

  it("rejects an empty patch with a readable message", () => {
    const result = updateTournamentSchema.safeParse({});

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe("Tidak ada perubahan yang dikirim.");
  });

  it("treats a blank string as an omitted optional field", () => {
    const result = updateTournamentSchema.safeParse({ startDate: "   " });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.startDate).toBeUndefined();
  });

  it("rejects an unknown status", () => {
    expect(updateTournamentSchema.safeParse({ status: "SELESAI" }).success).toBe(false);
  });
});

describe("createPenaltySchema", () => {
  it("accepts a corner and a penalty type", () => {
    const result = createPenaltySchema.safeParse({ corner: "RED", type: "TEGURAN_1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.refereeNote).toBeUndefined();
  });

  it("keeps a referee note and trims a blank one away", () => {
    expect(
      createPenaltySchema.safeParse({ corner: "BLUE", type: "PERINGATAN_1", refereeNote: "Keluar gelanggang" })
        .success
    ).toBe(true);

    const blank = createPenaltySchema.safeParse({
      corner: "BLUE",
      type: "PERINGATAN_1",
      refereeNote: "   ",
    });
    expect(blank.success).toBe(true);
    if (!blank.success) return;
    expect(blank.data.refereeNote).toBeUndefined();
  });

  it("rejects a note longer than 200 characters", () => {
    const result = createPenaltySchema.safeParse({
      corner: "RED",
      type: "TEGURAN_2",
      refereeNote: "x".repeat(201),
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown corner or penalty type", () => {
    expect(createPenaltySchema.safeParse({ corner: "GREEN", type: "TEGURAN_1" }).success).toBe(
      false
    );
    expect(createPenaltySchema.safeParse({ corner: "RED", type: "PERINGATAN_4" }).success).toBe(
      false
    );
  });

  it("does not accept a client supplied deduction amount", () => {
    const result = createPenaltySchema.safeParse({
      corner: "RED",
      type: "TEGURAN_1",
      pointsDeducted: 50,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect("pointsDeducted" in result.data).toBe(false);
  });

  it("requires both corner and type", () => {
    expect(createPenaltySchema.safeParse({ corner: "RED" }).success).toBe(false);
    expect(createPenaltySchema.safeParse({ type: "TEGURAN_1" }).success).toBe(false);
  });
});

describe("verifyJudgeSessionSchema", () => {
  it("accepts a 16 character hexadecimal access code", () => {
    expect(
      verifyJudgeSessionSchema.safeParse({
        matchId: "MATCH-1",
        judgeNumber: 1,
        accessCode: "a1b2c3d4e5f6a7b8",
      }).success
    ).toBe(true);
  });

  it("rejects a short, long, or non-hexadecimal code", () => {
    const base = { matchId: "MATCH-1", judgeNumber: 1 };

    expect(verifyJudgeSessionSchema.safeParse({ ...base, accessCode: "A1B2" }).success).toBe(false);
    expect(
      verifyJudgeSessionSchema.safeParse({ ...base, accessCode: "A1B2C3D4E5F6A7B8C9" }).success
    ).toBe(false);
    expect(
      verifyJudgeSessionSchema.safeParse({ ...base, accessCode: "Z1B2C3D4E5F6A7B8" }).success
    ).toBe(false);
  });
});
