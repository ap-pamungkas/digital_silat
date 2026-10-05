"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Match,
  Corner,
  ScoringAction,
  PenaltyType,
  MatchWinReason,
  DEFAULT_MATCH,
} from "@/lib/types";
import { apiClient } from "@/lib/api/client";
import {
  MatchScoringSnapshot,
  MatchTimerAction,
  MatchTimerSnapshot,
} from "@/lib/api/matches";
import {
  MATCH_REALTIME_EVENT,
  type MatchRealtimeEvent,
  type RealtimeStatus,
} from "@/lib/realtime/events";
import { publishMatchEvent } from "@/lib/realtime/supabase-client";
import {
  SCORE_CONSENSUS_WINDOW_MS,
  minJudgesRequiredForTotal,
} from "@/lib/scoring/rules";
import { useMatchRealtime } from "@/hooks/use-match-realtime";

export interface LastFeedbackState {
  corner: Corner;
  action: ScoringAction;
  points: number;
  timestamp: number;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  agreedJudges: number[];
}

export interface ScoringContextType {
  matches: Match[];
  activeMatch: Match;
  currentJudgeNumber: number;
  setCurrentJudgeNumber: (num: number) => void;
  submitScore: (
    corner: Corner,
    action: ScoringAction,
    points: number,
    overrideJudgeNumber?: number
  ) => Promise<void>;
  applyPenalty: (
    corner: Corner,
    type: PenaltyType,
    note?: string
  ) => Promise<void>;
  toggleTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  setRound: (round: number) => Promise<void>;
  nextRound: () => Promise<void>;
  endMatch: (winnerCorner: Corner, reason?: MatchWinReason) => Promise<void>;
  verifyEvent: (eventId: string) => Promise<void>;
  rejectEvent: (eventId: string) => Promise<void>;
  setActiveMatchId: (matchId: string) => void;
  lastFeedback: LastFeedbackState | null;
  refreshMatches: () => Promise<void>;
  isLoading: boolean;
  consensusWindowMs: number;
  minJudgesRequired: number;
  realtimeStatus: RealtimeStatus;
}

export const ScoringContext = createContext<ScoringContextType | null>(null);

const BROADCAST_CHANNEL_NAME = "digital_silat_scoring_bus";
const CONSENSUS_WINDOW_MS = SCORE_CONSENSUS_WINDOW_MS;
/**
 * Safety poll. Realtime delivers the snapshot immediately, this interval only
 * repairs a missed broadcast or a client that joined before the write landed.
 */
const SAFETY_POLL_INTERVAL_MS = 10000;

interface BroadcastMessage {
  type: "MATCH_UPDATED";
  payload: {
    match: Match;
    feedback?: LastFeedbackState;
  };
}

export function ScoringProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMatchId, setActiveMatchId] = useState<string>("");
  const [currentJudgeNumber, setCurrentJudgeNumber] = useState<number>(1);
  const [lastFeedback, setLastFeedback] = useState<LastFeedbackState | null>(null);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel for cross-tab realtime synchronization
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannelRef.current = channel;

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const msg = event.data;
      if (!msg || msg.type !== "MATCH_UPDATED") return;

      const updatedMatch = msg.payload.match;
      setMatches((prev) =>
        prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
      );
      if (msg.payload.feedback) {
        setLastFeedback(msg.payload.feedback);
      }
    };

    return () => {
      channel.close();
      broadcastChannelRef.current = null;
    };
  }, []);

  const broadcastMatchUpdate = useCallback(
    (match: Match, feedback?: LastFeedbackState) => {
      try {
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: "MATCH_UPDATED",
            payload: { match, feedback },
          });
        }
      } catch (e) {
        console.warn("Broadcast error:", e);
      }
    },
    []
  );

  const refreshMatches = useCallback(async () => {
    try {
      const data = await apiClient.matches.list();
      if (Array.isArray(data)) {
        setMatches(data);
        const liveMatch = data.find((m: Match) => m.status === "LIVE");
        setActiveMatchId(liveMatch?.id ?? data[0]?.id ?? "");
      }
    } catch (err) {
      console.warn("Error fetching matches:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await apiClient.matches.list();
        if (isMounted && Array.isArray(data)) {
          setMatches(data);
          const liveMatch = data.find((m: Match) => m.status === "LIVE");
          setActiveMatchId(liveMatch?.id ?? data[0]?.id ?? "");
        }
      } catch (err) {
        console.warn("Initial load error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeMatch =
    matches.find((m) => m.id === activeMatchId) || matches[0] || DEFAULT_MATCH;

  const applyTimerSnapshot = useCallback((snapshot: MatchTimerSnapshot) => {
    setMatches((prev) => prev.map((match) => match.id === snapshot.matchId
      ? {
          ...match,
          currentRound: snapshot.currentRound,
          timeRemainingSeconds: snapshot.timeRemainingSeconds,
          timerStatus: snapshot.timerStatus,
          status: snapshot.status,
        }
      : match));
  }, []);

  const applyScoringSnapshot = useCallback((snapshot: MatchScoringSnapshot) => {
    setMatches((prev) => prev.map((match) => match.id === snapshot.matchId
      ? {
          ...match,
          redScore: snapshot.redScore,
          blueScore: snapshot.blueScore,
          events: snapshot.events,
          redPenalties: snapshot.redPenalties,
          bluePenalties: snapshot.bluePenalties,
        }
      : match));
  }, []);

  const applyMatchStatus = useCallback(
    (
      matchId: string,
      payload: {
        status: Match["status"];
        currentRound?: number;
        winnerCorner?: Corner;
        winReason?: string;
      }
    ) => {
      setMatches((prev) =>
        prev.map((match) =>
          match.id !== matchId
            ? match
            : {
                ...match,
                status: payload.status,
                currentRound: payload.currentRound ?? match.currentRound,
                winner: payload.winnerCorner ?? match.winner,
                winReason: payload.winReason ?? match.winReason,
              }
        )
      );
    },
    []
  );

  const realtimeStatus = useMatchRealtime(
    activeMatch.id === "NO_MATCH" ? null : activeMatch.id,
    (event: MatchRealtimeEvent) => {
      if (event.type === MATCH_REALTIME_EVENT.scoringSnapshot) {
        applyScoringSnapshot(event.payload);
        return;
      }
      if (event.type === MATCH_REALTIME_EVENT.timerSnapshot) {
        applyTimerSnapshot(event.payload);
        return;
      }
      applyMatchStatus(event.matchId, event.payload);
    }
  );

  const publishScoringSnapshot = useCallback(
    (snapshot: MatchScoringSnapshot) => {
      void publishMatchEvent({
        type: MATCH_REALTIME_EVENT.scoringSnapshot,
        matchId: snapshot.matchId,
        payload: snapshot,
      });
    },
    []
  );

  const publishTimerSnapshot = useCallback((snapshot: MatchTimerSnapshot) => {
    void publishMatchEvent({
      type: MATCH_REALTIME_EVENT.timerSnapshot,
      matchId: snapshot.matchId,
      payload: snapshot,
    });
  }, []);

  const sendTimerAction = useCallback(async (action: MatchTimerAction, round?: number) => {
    if (activeMatch.id === "NO_MATCH") return;
    const snapshot = await apiClient.matches.updateTimer(activeMatch.id, action, round);
    applyTimerSnapshot(snapshot);
    publishTimerSnapshot(snapshot);
  }, [activeMatch.id, applyTimerSnapshot, publishTimerSnapshot]);

  useEffect(() => {
    if (activeMatch.id === "NO_MATCH") return;

    let isCancelled = false;
    let isFetching = false;
    const syncScoring = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const snapshot = await apiClient.matches.getScoringSnapshot(activeMatch.id);
        if (!isCancelled) applyScoringSnapshot(snapshot);
      } catch (error) {
        if (!isCancelled) console.warn("Failed to synchronize score events:", error);
      } finally {
        isFetching = false;
      }
    };

    void Promise.resolve().then(syncScoring);
    const interval = setInterval(() => void syncScoring(), SAFETY_POLL_INTERVAL_MS);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [activeMatch.id, applyScoringSnapshot]);

  // Safety poll for the timer fields so separate judge/operator devices share server time.
  useEffect(() => {
    if (activeMatch.id === "NO_MATCH") return;

    let isCancelled = false;
    let isFetching = false;
    const syncTimer = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const snapshot = await apiClient.matches.getTimer(activeMatch.id);
        if (!isCancelled) applyTimerSnapshot(snapshot);
      } catch (error) {
        if (!isCancelled) console.warn("Failed to synchronize match timer:", error);
      } finally {
        isFetching = false;
      }
    };

    void Promise.resolve().then(syncTimer);
    const interval = setInterval(() => void syncTimer(), SAFETY_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [activeMatch.id, applyTimerSnapshot]);

  const submitScore = useCallback(
    async (
      corner: Corner,
      action: ScoringAction,
      points: number,
      overrideJudgeNumber?: number
    ) => {
      const judgeNum = overrideJudgeNumber || currentJudgeNumber;
      if (activeMatch.id === "NO_MATCH") throw new Error("Belum ada pertandingan aktif.");
      const result = await apiClient.matches.submitScoreEvent(activeMatch.id, {
        corner,
        action,
        points,
        judgeNumber: judgeNum,
      });
      applyScoringSnapshot(result.snapshot);
      publishScoringSnapshot(result.snapshot);
      const isVerified = result.snapshot.events.some(
        (e) =>
          e.corner === corner &&
          e.action === action &&
          e.status === "VERIFIED" &&
          (e.judgesAgreed?.includes(judgeNum) || e.judgeNumber === judgeNum)
      );
      setLastFeedback({
        corner,
        action,
        points,
        timestamp: Date.now(),
        status: isVerified ? "VERIFIED" : "PENDING",
        agreedJudges: result.agreedJudges,
      });
    },
    [activeMatch, currentJudgeNumber, applyScoringSnapshot, publishScoringSnapshot]
  );

  const applyPenalty = useCallback(
    async (corner: Corner, type: PenaltyType, note?: string) => {
      if (activeMatch.id === "NO_MATCH") throw new Error("Belum ada pertandingan aktif.");
      const result = await apiClient.matches.applyPenalty(activeMatch.id, {
        corner,
        type,
        refereeNote: note,
      });
      applyScoringSnapshot(result.snapshot);
      publishScoringSnapshot(result.snapshot);
    },
    [activeMatch.id, applyScoringSnapshot, publishScoringSnapshot]
  );

  const toggleTimer = useCallback(async () => {
    await sendTimerAction(activeMatch.timerStatus === "RUNNING" ? "PAUSE" : "START");
  }, [activeMatch.timerStatus, sendTimerAction]);

  const resetTimer = useCallback(async () => {
    await sendTimerAction("RESET");
  }, [sendTimerAction]);

  const setRound = useCallback(
    async (round: number) => {
      await sendTimerAction("SET_ROUND", round);
    },
    [sendTimerAction]
  );

  const nextRound = useCallback(async () => {
    await sendTimerAction("NEXT_ROUND");
  }, [sendTimerAction]);

  const endMatch = useCallback(
    async (winnerCorner: Corner, reason: MatchWinReason = "MENANG_ANGKA") => {
      if (activeMatch.id === "NO_MATCH") throw new Error("Belum ada partai aktif.");

      await apiClient.matches.updateStatus({
        matchId: activeMatch.id,
        status: "FINISHED",
        winnerCorner,
        winReason: reason,
      });

      const updatedMatch: Match = {
        ...activeMatch,
        status: "FINISHED",
        timerStatus: "FINISHED",
        timeRemainingSeconds: 0,
        winner: winnerCorner,
        winReason: reason.replace(/_/g, " "),
      };

      setMatches((previousMatches) => previousMatches.map((match) =>
        match.id === updatedMatch.id ? updatedMatch : match
      ));
      broadcastMatchUpdate(updatedMatch);
      void publishMatchEvent({
        type: MATCH_REALTIME_EVENT.matchStatus,
        matchId: activeMatch.id,
        payload: {
          status: "FINISHED",
          currentRound: updatedMatch.currentRound,
          winnerCorner,
          winReason: reason,
        },
      });
      publishScoringSnapshot(await apiClient.matches.getScoringSnapshot(activeMatch.id));
    },
    [activeMatch, broadcastMatchUpdate, publishScoringSnapshot]
  );

  /**
   * Petugas Gelanggang SAHKAN Putusan Skor (Approve & Add Points)
   */
  const verifyEvent = useCallback(
    async (eventId: string) => {
      const targetEvent = activeMatch.events.find((event) => event.id === eventId);
      const snapshot = await apiClient.matches.decideScoreEvent(activeMatch.id, eventId, "VERIFY");
      applyScoringSnapshot(snapshot);
      publishScoringSnapshot(snapshot);
      if (targetEvent) {
        setLastFeedback({
          corner: targetEvent.corner,
          action: targetEvent.action,
          points: targetEvent.points,
          timestamp: Date.now(),
          status: "VERIFIED",
          agreedJudges: targetEvent.judgesAgreed || [targetEvent.judgeNumber],
        });
      }
    },
    [activeMatch, applyScoringSnapshot, publishScoringSnapshot]
  );

  /**
   * Petugas Gelanggang TOLAK Putusan Skor (Reject / Invalidate)
   */
  const rejectEvent = useCallback(
    async (eventId: string) => {
      const targetEvent = activeMatch.events.find((event) => event.id === eventId);
      const snapshot = await apiClient.matches.decideScoreEvent(activeMatch.id, eventId, "REJECT");
      applyScoringSnapshot(snapshot);
      publishScoringSnapshot(snapshot);
      if (targetEvent) {
        setLastFeedback({
          corner: targetEvent.corner,
          action: targetEvent.action,
          points: targetEvent.points,
          timestamp: Date.now(),
          status: "REJECTED",
          agreedJudges: targetEvent.judgesAgreed || [targetEvent.judgeNumber],
        });
      }
    },
    [activeMatch, applyScoringSnapshot, publishScoringSnapshot]
  );

  return (
    <ScoringContext.Provider
      value={{
        matches,
        activeMatch,
        currentJudgeNumber,
        setCurrentJudgeNumber,
        submitScore,
        applyPenalty,
        toggleTimer,
        resetTimer,
        setRound,
        nextRound,
        endMatch,
        verifyEvent,
        rejectEvent,
        setActiveMatchId,
        lastFeedback,
        refreshMatches,
        isLoading,
        consensusWindowMs: CONSENSUS_WINDOW_MS,
        minJudgesRequired: minJudgesRequiredForTotal(5),
        realtimeStatus,
      }}
    >
      {children}
    </ScoringContext.Provider>
  );
}

export function useScoringContext() {
  const context = useContext(ScoringContext);
  if (!context) {
    throw new Error("useScoring must be used within a ScoringProvider");
  }
  return context;
}
