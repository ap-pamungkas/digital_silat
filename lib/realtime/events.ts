import type { MatchScoringSnapshot, MatchTimerSnapshot } from "@/lib/api/matches";
import type { Corner, ConnectionStatus, MatchStatus, MatchWinReason } from "@/lib/types";

/**
 * Realtime contract shared by the operator, the five judges, the score display,
 * and the OBS overlay.
 *
 * The payload is always the snapshot that the server already persisted, so a
 * subscriber can trust it without another round trip. Events are published only
 * after the database write is confirmed.
 */

export const MATCH_CHANNEL_PREFIX = "match";

export function matchChannelName(matchId: string): string {
  return `${MATCH_CHANNEL_PREFIX}:${matchId}`;
}

export const MATCH_REALTIME_EVENT = {
  scoringSnapshot: "scoring_snapshot",
  timerSnapshot: "timer_snapshot",
  matchStatus: "match_status",
} as const;

export type MatchRealtimeEventType =
  (typeof MATCH_REALTIME_EVENT)[keyof typeof MATCH_REALTIME_EVENT];

export interface MatchStatusPayload {
  status: MatchStatus;
  currentRound?: number;
  winnerCorner?: Corner;
  winReason?: MatchWinReason;
}

export interface MatchScoringRealtimeEvent {
  type: typeof MATCH_REALTIME_EVENT.scoringSnapshot;
  matchId: string;
  payload: MatchScoringSnapshot;
}

export interface MatchTimerRealtimeEvent {
  type: typeof MATCH_REALTIME_EVENT.timerSnapshot;
  matchId: string;
  payload: MatchTimerSnapshot;
}

export interface MatchStatusRealtimeEvent {
  type: typeof MATCH_REALTIME_EVENT.matchStatus;
  matchId: string;
  payload: MatchStatusPayload;
}

export type MatchRealtimeEvent =
  | MatchScoringRealtimeEvent
  | MatchTimerRealtimeEvent
  | MatchStatusRealtimeEvent;

/**
 * Realtime channel lifecycle as the UI reports it. `UNAVAILABLE` means Supabase
 * is not configured for this deployment, so the client keeps polling instead of
 * pretending it is connected.
 */
export type RealtimeStatus =
  | "CONNECTING"
  | "LIVE"
  | "RECONNECTING"
  | "OFFLINE"
  | "UNAVAILABLE";

export function isMatchRealtimeEvent(value: unknown): value is MatchRealtimeEvent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { type?: unknown; matchId?: unknown; payload?: unknown };
  return (
    typeof candidate.type === "string" &&
    typeof candidate.matchId === "string" &&
    Object.values(MATCH_REALTIME_EVENT).includes(candidate.type as MatchRealtimeEventType) &&
    candidate.payload !== undefined
  );
}

/**
 * Maps the transport state onto the `ConnectionStatus` the judge UI already
 * renders. An unconfigured deployment reports `OFFLINE` because no realtime
 * transport exists, and the screen then runs on the polling fallback.
 */
export function toConnectionStatus(status: RealtimeStatus): ConnectionStatus {
  switch (status) {
    case "LIVE":
      return "ONLINE";
    case "CONNECTING":
    case "RECONNECTING":
      return "RECONNECTING";
    case "OFFLINE":
    case "UNAVAILABLE":
      return "OFFLINE";
  }
}

export const REALTIME_STATUS_LABELS: Record<RealtimeStatus, string> = {
  CONNECTING: "Menghubungkan",
  LIVE: "Realtime Aktif",
  RECONNECTING: "Menghubungkan Ulang",
  OFFLINE: "Realtime Terputus",
  UNAVAILABLE: "Polling Cadangan",
};