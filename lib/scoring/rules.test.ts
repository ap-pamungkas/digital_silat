import { describe, expect, it } from "vitest";
import {
  MIN_JUDGES_REQUIRED,
  SCORE_CONSENSUS_WINDOW_MS,
  SCORE_POINTS,
  SCOREABLE_ACTIONS,
  agreedJudgeNumbers,
  buildScoreEventGroups,
  isMatchStage,
  isMatchTimerAction,
  isScoringAction,
  minJudgesRequiredForTotal,
  scorePointsForAction,
  toMatchStage,
} from "@/lib/scoring/rules";
import type { ScoreEvent } from "@/lib/types";

function scoreEvent(overrides: Partial<ScoreEvent> = {}): ScoreEvent {
  return {
    id: "EVT-1",
    matchId: "MATCH-1",
    judgeId: "JUDGE-1",
    judgeNumber: 1,
    corner: "RED",
    action: "PUKULAN",
    points: 1,
    round: 1,
    matchTime: "01:30",
    timestamp: 1_000,
    verified: true,
    status: "VERIFIED",
    ...overrides,
  };
}

describe("SCORE_POINTS", () => {
  it("assigns the official point value per scoring action", () => {
    expect(SCORE_POINTS.PUKULAN).toBe(1);
    expect(SCORE_POINTS.TENDANGAN).toBe(2);
    expect(SCORE_POINTS.JATUHAN).toBe(3);
    expect(SCORE_POINTS.TANGKISAN_PUKULAN).toBe(2);
    expect(SCORE_POINTS.TANGKISAN_TENDANGAN).toBe(3);
  });

  it("gives no points for HUKUMAN because it is handled as a penalty", () => {
    expect(scorePointsForAction("HUKUMAN")).toBeUndefined();
    expect(SCOREABLE_ACTIONS).not.toContain("HUKUMAN");
    expect(SCOREABLE_ACTIONS).toHaveLength(5);
  });

  it("returns undefined for a value that is not a scoring action", () => {
    expect(scorePointsForAction("MENGIKAT" as never)).toBeUndefined();
  });
});

describe("type guards", () => {
  it("recognises scoring actions, match stages, and timer actions", () => {
    expect(isScoringAction("JATUHAN")).toBe(true);
    expect(isScoringAction("JATUHAN_TEDAK")).toBe(false);
    expect(isScoringAction(3)).toBe(false);

    expect(isMatchStage("FINAL")).toBe(true);
    expect(isMatchStage("BABAK FINAL")).toBe(false);

    expect(isMatchTimerAction("NEXT_ROUND")).toBe(true);
    expect(isMatchTimerAction("SKIP_ROUND")).toBe(false);
  });
});

describe("toMatchStage", () => {
  it("normalises prefixed labels into enum values", () => {
    expect(toMatchStage("BABAK FINAL")).toBe("FINAL");
    expect(toMatchStage("babak semi final")).toBe("SEMI_FINAL");
    expect(toMatchStage("PEREMPAT  FINAL")).toBe("PEREMPAT_FINAL");
  });

  it("falls back when the label cannot be mapped", () => {
    expect(toMatchStage("BABAK MISTERI")).toBe("PENYISIHAN");
    expect(toMatchStage("BABAK SEMINAL")).toBe("PENYISIHAN");
    expect(toMatchStage("BABAK MISTERI", "FINAL")).toBe("FINAL");
  });
});

describe("buildScoreEventGroups", () => {
  it("groups judges that agree within the consensus window", () => {
    const events = [
      scoreEvent({ id: "A", judgeNumber: 1, timestamp: 1_000 }),
      scoreEvent({ id: "B", judgeNumber: 2, timestamp: 1_400 }),
      scoreEvent({ id: "C", judgeNumber: 3, timestamp: 1_600 }),
    ];

    const { groups } = buildScoreEventGroups(events);

    expect(groups).toHaveLength(1);
    expect(groups[0].events.map((event) => event.id)).toEqual(["A", "B", "C"]);
    expect(groups[0].firstTimestamp).toBe(1_000);
  });

  it("splits judges that press outside the consensus window", () => {
    const events = [
      scoreEvent({ id: "A", judgeNumber: 1, timestamp: 1_000 }),
      scoreEvent({ id: "B", judgeNumber: 2, timestamp: 1_000 + SCORE_CONSENSUS_WINDOW_MS + 1 }),
    ];

    const { groups } = buildScoreEventGroups(events);

    expect(groups).toHaveLength(2);
  });

  it("measures the window from the first event of a group, not the previous one", () => {
    const events = [
      scoreEvent({ id: "A", judgeNumber: 1, timestamp: 1_000 }),
      scoreEvent({ id: "B", judgeNumber: 2, timestamp: 2_500 }),
      scoreEvent({ id: "C", judgeNumber: 3, timestamp: 3_001 }),
    ];

    const { groups } = buildScoreEventGroups(events);

    expect(groups).toHaveLength(2);
    expect(groups[0].events.map((event) => event.id)).toEqual(["A", "B"]);
    expect(groups[1].events.map((event) => event.id)).toEqual(["C"]);
  });

  it("includes an event exactly on the consensus window boundary", () => {
    const events = [
      scoreEvent({ id: "A", judgeNumber: 1, timestamp: 1_000 }),
      scoreEvent({
        id: "B",
        judgeNumber: 2,
        timestamp: 1_000 + SCORE_CONSENSUS_WINDOW_MS,
      }),
    ];

    const { groups } = buildScoreEventGroups(events);

    expect(groups).toHaveLength(1);
  });

  it("never merges different corners, actions, rounds, or statuses", () => {
    const events = [
      scoreEvent({ id: "A", corner: "RED", action: "PUKULAN" }),
      scoreEvent({ id: "B", corner: "BLUE", action: "PUKULAN" }),
      scoreEvent({ id: "C", corner: "RED", action: "TENDANGAN" }),
      scoreEvent({ id: "D", corner: "RED", action: "PUKULAN", round: 2 }),
      scoreEvent({ id: "E", corner: "RED", action: "PUKULAN", status: "REJECTED" }),
    ];

    const { groups } = buildScoreEventGroups(events);

    expect(groups).toHaveLength(5);
  });

  it("sorts unordered input by timestamp before grouping", () => {
    const events = [
      scoreEvent({ id: "B", judgeNumber: 2, timestamp: 1_500 }),
      scoreEvent({ id: "A", judgeNumber: 1, timestamp: 1_000 }),
    ];

    const { groups } = buildScoreEventGroups(events);

    expect(groups).toHaveLength(1);
    expect(groups[0].firstTimestamp).toBe(1_000);
  });

  it("maps every event id to its group", () => {
    const events = [
      scoreEvent({ id: "A", judgeNumber: 1 }),
      scoreEvent({ id: "B", judgeNumber: 2, corner: "BLUE" }),
    ];

    const { groups, groupByEventId } = buildScoreEventGroups(events);

    expect(groupByEventId.get("A")).toBe(groups[0]);
    expect(groupByEventId.get("B")).toBe(groups[1]);
  });

  it("returns empty collections when there are no events", () => {
    const { groups, groupByEventId } = buildScoreEventGroups([]);

    expect(groups).toEqual([]);
    expect(groupByEventId.size).toBe(0);
  });
});

describe("agreedJudgeNumbers", () => {
  it("deduplicates and sorts the judges inside a group", () => {
    const events = [
      scoreEvent({ id: "A", judgeNumber: 5 }),
      scoreEvent({ id: "B", judgeNumber: 2 }),
      scoreEvent({ id: "C", judgeNumber: 5 }),
      scoreEvent({ id: "D", judgeNumber: 1 }),
    ];

    const { groups, groupByEventId } = buildScoreEventGroups(events);

    expect(agreedJudgeNumbers(groupByEventId.get("A"), [])).toEqual([1, 2, 5]);
    expect(groups[0].events.length).toBe(4);
  });

  it("uses the fallback when the event has no group", () => {
    expect(agreedJudgeNumbers(undefined, [3, 1])).toEqual([3, 1]);
  });

  it("treats a group with a single judge as not agreed yet", () => {
    const { groupByEventId } = buildScoreEventGroups([scoreEvent()]);

    expect(agreedJudgeNumbers(groupByEventId.get("EVT-1"), []).length).toBeLessThan(
      MIN_JUDGES_REQUIRED
    );
  });
});

describe("minJudgesRequiredForTotal", () => {
  it("requires 2 judges when total judges is 3 or less", () => {
    expect(minJudgesRequiredForTotal(1)).toBe(2);
    expect(minJudgesRequiredForTotal(2)).toBe(2);
    expect(minJudgesRequiredForTotal(3)).toBe(2);
  });

  it("requires 3 judges when total judges is greater than 3 (4 or 5 judges)", () => {
    expect(minJudgesRequiredForTotal(4)).toBe(3);
    expect(minJudgesRequiredForTotal(5)).toBe(3);
  });
});