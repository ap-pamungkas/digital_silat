import { describe, expect, it } from "vitest";
import {
  MATCH_REALTIME_EVENT,
  REALTIME_STATUS_LABELS,
  isMatchRealtimeEvent,
  matchChannelName,
  toConnectionStatus,
  type MatchRealtimeEvent,
} from "@/lib/realtime/events";
import type { MatchScoringSnapshot } from "@/lib/api/matches";

const snapshot: MatchScoringSnapshot = {
  matchId: "MATCH-1",
  redScore: 3,
  blueScore: 1,
  events: [],
  redPenalties: [],
  bluePenalties: [],
};

describe("matchChannelName", () => {
  it("scopes one channel per match", () => {
    expect(matchChannelName("MATCH-1")).toBe("match:MATCH-1");
    expect(matchChannelName("MATCH-1")).not.toBe(matchChannelName("MATCH-2"));
  });
});

describe("isMatchRealtimeEvent", () => {
  it("accepts the three snapshot events", () => {
    const events: MatchRealtimeEvent[] = [
      { type: MATCH_REALTIME_EVENT.scoringSnapshot, matchId: "MATCH-1", payload: snapshot },
      {
        type: MATCH_REALTIME_EVENT.timerSnapshot,
        matchId: "MATCH-1",
        payload: {
          matchId: "MATCH-1",
          currentRound: 1,
          timeRemainingSeconds: 60,
          timerStatus: "RUNNING",
          status: "LIVE",
        },
      },
      {
        type: MATCH_REALTIME_EVENT.matchStatus,
        matchId: "MATCH-1",
        payload: { status: "FINISHED", winnerCorner: "BLUE" },
      },
    ];

    for (const event of events) {
      expect(isMatchRealtimeEvent(event)).toBe(true);
    }
  });

  it("rejects payloads that are not part of the contract", () => {
    expect(isMatchRealtimeEvent(null)).toBe(false);
    expect(isMatchRealtimeEvent("match:MATCH-1")).toBe(false);
    expect(isMatchRealtimeEvent({ type: "unknown", matchId: "MATCH-1", payload: {} })).toBe(false);
    expect(isMatchRealtimeEvent({ type: MATCH_REALTIME_EVENT.scoringSnapshot, payload: snapshot })).toBe(
      false
    );
    expect(isMatchRealtimeEvent({ type: MATCH_REALTIME_EVENT.scoringSnapshot, matchId: "MATCH-1" })).toBe(
      false
    );
  });
});

describe("toConnectionStatus", () => {
  it("reports a live channel as online", () => {
    expect(toConnectionStatus("LIVE")).toBe("ONLINE");
  });

  it("reports connecting and reconnecting as such", () => {
    expect(toConnectionStatus("CONNECTING")).toBe("RECONNECTING");
    expect(toConnectionStatus("RECONNECTING")).toBe("RECONNECTING");
  });

  it("never claims a connection when realtime is off or unavailable", () => {
    expect(toConnectionStatus("OFFLINE")).toBe("OFFLINE");
    expect(toConnectionStatus("UNAVAILABLE")).toBe("OFFLINE");
  });
});

describe("REALTIME_STATUS_LABELS", () => {
  it("has a label for every transport state", () => {
    for (const status of [
      "CONNECTING",
      "LIVE",
      "RECONNECTING",
      "OFFLINE",
      "UNAVAILABLE",
    ] as const) {
      expect(REALTIME_STATUS_LABELS[status].length).toBeGreaterThan(0);
    }
  });

  it("does not claim realtime while running on the fallback", () => {
    expect(REALTIME_STATUS_LABELS.UNAVAILABLE).toBe("Polling Cadangan");
  });
});