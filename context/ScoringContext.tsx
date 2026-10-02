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
  PenaltyRecord,
  MatchWinReason,
  DEFAULT_MATCH,
} from "@/lib/types";
import { apiClient } from "@/lib/api/client";
import {
  MatchScoringSnapshot,
  MatchTimerAction,
  MatchTimerSnapshot,
} from "@/lib/api/matches";

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
    points: number,
    note?: string
  ) => void;
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
}

const ScoringContext = createContext<ScoringContextType | null>(null);

const BROADCAST_CHANNEL_NAME = "digital_silat_scoring_bus";
const CONSENSUS_WINDOW_MS = 2000;
const MIN_JUDGES_REQUIRED = 2;

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

  const sendTimerAction = useCallback(async (action: MatchTimerAction, round?: number) => {
    if (activeMatch.id === "NO_MATCH") return;
    const snapshot = await apiClient.matches.updateTimer(activeMatch.id, action, round);
    applyTimerSnapshot(snapshot);
  }, [activeMatch.id, applyTimerSnapshot]);

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
    const interval = setInterval(() => void syncScoring(), 1000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [activeMatch.id, applyScoringSnapshot]);

  // Poll only the timer fields so separate judge/operator devices share server time.
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
    const interval = setInterval(() => void syncTimer(), 1000);

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
      setLastFeedback({
        corner,
        action,
        points,
        timestamp: Date.now(),
        status: "PENDING",
        agreedJudges: result.agreedJudges,
      });
    },
    [activeMatch, currentJudgeNumber, applyScoringSnapshot]
  );

  const applyPenalty = useCallback(
    (corner: Corner, type: PenaltyType, points: number, note?: string) => {
      const newPenalty: PenaltyRecord = {
        id: `PEN-${Date.now()}`,
        matchId: activeMatch.id,
        corner,
        type,
        pointsDeducted: points,
        round: activeMatch.currentRound,
        timestamp: Date.now(),
        refereeNote: note || "Pelanggaran Wasit",
      };

      let targetUpdated: Match | null = null;

      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatch.id) return m;
          const updatedRedScore =
            corner === "RED" ? Math.max(0, m.redScore - points) : m.redScore;
          const updatedBlueScore =
            corner === "BLUE" ? Math.max(0, m.blueScore - points) : m.blueScore;

          const updated: Match = {
            ...m,
            redScore: updatedRedScore,
            blueScore: updatedBlueScore,
            redPenalties:
              corner === "RED" ? [...m.redPenalties, newPenalty] : m.redPenalties,
            bluePenalties:
              corner === "BLUE" ? [...m.bluePenalties, newPenalty] : m.bluePenalties,
          };
          targetUpdated = updated;
          return updated;
        })
      );

      if (targetUpdated) {
        broadcastMatchUpdate(targetUpdated);
      }
    },
    [activeMatch, broadcastMatchUpdate]
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
    },
    [activeMatch, broadcastMatchUpdate]
  );

  /**
   * Petugas Gelanggang SAHKAN Putusan Skor (Approve & Add Points)
   */
  const verifyEvent = useCallback(
    async (eventId: string) => {
      const targetEvent = activeMatch.events.find((event) => event.id === eventId);
      const snapshot = await apiClient.matches.decideScoreEvent(activeMatch.id, eventId, "VERIFY");
      applyScoringSnapshot(snapshot);
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
    [activeMatch, applyScoringSnapshot]
  );

  /**
   * Petugas Gelanggang TOLAK Putusan Skor (Reject / Invalidate)
   */
  const rejectEvent = useCallback(
    async (eventId: string) => {
      const targetEvent = activeMatch.events.find((event) => event.id === eventId);
      const snapshot = await apiClient.matches.decideScoreEvent(activeMatch.id, eventId, "REJECT");
      applyScoringSnapshot(snapshot);
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
    [activeMatch, applyScoringSnapshot]
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
        minJudgesRequired: MIN_JUDGES_REQUIRED,
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
