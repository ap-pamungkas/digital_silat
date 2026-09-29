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
  ScoreEvent,
  Corner,
  ScoringAction,
  PenaltyType,
  PenaltyRecord,
  DEFAULT_MATCH,
} from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { apiClient } from "@/lib/api";

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
  ) => void;
  applyPenalty: (
    corner: Corner,
    type: PenaltyType,
    points: number,
    note?: string
  ) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setRound: (round: number) => void;
  nextRound: () => void;
  endMatch: (winnerCorner?: Corner, reason?: string) => void;
  verifyEvent: (eventId: string) => void;
  rejectEvent: (eventId: string) => void;
  setActiveMatchId: (matchId: string) => void;
  lastFeedback: LastFeedbackState | null;
  refreshMatches: () => Promise<void>;
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
      if (Array.isArray(data) && data.length > 0) {
        setMatches(data);
        const liveMatch = data.find((m: Match) => m.status === "LIVE");
        setActiveMatchId(liveMatch ? liveMatch.id : data[0].id);
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
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setMatches(data);
          const liveMatch = data.find((m: Match) => m.status === "LIVE");
          setActiveMatchId(liveMatch ? liveMatch.id : data[0].id);
        }
      } catch (err) {
        console.warn("Initial load error:", err);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeMatch =
    matches.find((m) => m.id === activeMatchId) || matches[0] || DEFAULT_MATCH;

  // Timer Tick Simulation
  useEffect(() => {
    if (activeMatch.timerStatus !== "RUNNING") return;

    const interval = setInterval(() => {
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatchId || m.timerStatus !== "RUNNING") return m;
          if (m.timeRemainingSeconds <= 1) {
            const updated = {
              ...m,
              timeRemainingSeconds: 0,
              timerStatus: "FINISHED" as const,
            };
            broadcastMatchUpdate(updated);
            return updated;
          }
          return {
            ...m,
            timeRemainingSeconds: m.timeRemainingSeconds - 1,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMatch.timerStatus, activeMatchId, broadcastMatchUpdate]);

  /**
   * Scoring Action from Judge -> Sends PENDING event to Operator
   */
  const submitScore = useCallback(
    (
      corner: Corner,
      action: ScoringAction,
      points: number,
      overrideJudgeNumber?: number
    ) => {
      const judgeNum = overrideJudgeNumber || currentJudgeNumber;
      const now = Date.now();
      const matchTimeStr = formatTime(activeMatch.timeRemainingSeconds);

      let feedbackState: LastFeedbackState | null = null;
      let targetUpdatedMatch: Match | null = null;

      setMatches((prevMatches) => {
        const next = prevMatches.map((match) => {
          if (match.id !== activeMatch.id) return match;

          const existingPendingIndex = match.events.findIndex(
            (e) =>
              e.status === "PENDING" &&
              e.round === match.currentRound &&
              e.corner === corner &&
              e.action === action &&
              now - e.timestamp <= 4000
          );

          let updatedEvents = [...match.events];

          if (existingPendingIndex >= 0) {
            const existingEvt = match.events[existingPendingIndex];
            const currentJudges = existingEvt.judgesAgreed || [existingEvt.judgeNumber];

            const newJudges = currentJudges.includes(judgeNum)
              ? currentJudges
              : [...currentJudges, judgeNum];

            const updatedEvt: ScoreEvent = {
              ...existingEvt,
              judgesAgreed: newJudges,
            };

            updatedEvents[existingPendingIndex] = updatedEvt;

            feedbackState = {
              corner,
              action,
              points,
              timestamp: now,
              status: "PENDING",
              agreedJudges: newJudges,
            };
          } else {
            const newEvent: ScoreEvent = {
              id: `EVT-${now}-${Math.random().toString(36).substring(2, 6)}`,
              matchId: match.id,
              judgeId: `JURI-${judgeNum}`,
              judgeNumber: judgeNum,
              corner,
              action,
              points,
              round: match.currentRound,
              matchTime: matchTimeStr,
              timestamp: now,
              verified: false,
              status: "PENDING",
              judgesAgreed: [judgeNum],
            };

            updatedEvents = [newEvent, ...updatedEvents];

            feedbackState = {
              corner,
              action,
              points,
              timestamp: now,
              status: "PENDING",
              agreedJudges: [judgeNum],
            };
          }

          const updatedMatch: Match = {
            ...match,
            events: updatedEvents,
          };
          targetUpdatedMatch = updatedMatch;
          return updatedMatch;
        });

        return next;
      });

      if (feedbackState) {
        setLastFeedback(feedbackState);
      }
      if (targetUpdatedMatch && feedbackState) {
        broadcastMatchUpdate(targetUpdatedMatch, feedbackState);
      }
    },
    [activeMatch, currentJudgeNumber, broadcastMatchUpdate]
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

  const toggleTimer = useCallback(() => {
    let targetUpdated: Match | null = null;
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatch.id) return m;
        const newStatus =
          m.timerStatus === "RUNNING" ? ("PAUSED" as const) : ("RUNNING" as const);
        const updated: Match = {
          ...m,
          timerStatus: newStatus,
          status: newStatus === "RUNNING" ? ("LIVE" as const) : ("PAUSED" as const),
        };
        targetUpdated = updated;
        return updated;
      })
    );
    if (targetUpdated) broadcastMatchUpdate(targetUpdated);
  }, [activeMatch.id, broadcastMatchUpdate]);

  const resetTimer = useCallback(() => {
    let targetUpdated: Match | null = null;
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatch.id) return m;
        const updated: Match = {
          ...m,
          timeRemainingSeconds: m.roundDurationSeconds,
          timerStatus: "READY" as const,
          status: "PAUSED" as const,
        };
        targetUpdated = updated;
        return updated;
      })
    );
    if (targetUpdated) broadcastMatchUpdate(targetUpdated);
  }, [activeMatch.id, broadcastMatchUpdate]);

  const setRound = useCallback(
    (round: number) => {
      let targetUpdated: Match | null = null;
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatch.id) return m;
          const updated: Match = {
            ...m,
            currentRound: round,
            timeRemainingSeconds: m.roundDurationSeconds,
            timerStatus: "READY" as const,
          };
          targetUpdated = updated;
          return updated;
        })
      );
      if (targetUpdated) broadcastMatchUpdate(targetUpdated);
    },
    [activeMatch.id, broadcastMatchUpdate]
  );

  const nextRound = useCallback(() => {
    let targetUpdated: Match | null = null;
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatch.id) return m;
        const nextR = Math.min(m.totalRounds, m.currentRound + 1);
        const updated: Match = {
          ...m,
          currentRound: nextR,
          timeRemainingSeconds: m.roundDurationSeconds,
          timerStatus: "READY" as const,
        };
        targetUpdated = updated;
        return updated;
      })
    );
    if (targetUpdated) broadcastMatchUpdate(targetUpdated);
  }, [activeMatch.id, broadcastMatchUpdate]);

  const endMatch = useCallback(
    (winnerCorner?: Corner, reason = "KEPUTUSAN JURI / WASIT") => {
      let targetUpdated: Match | null = null;
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatch.id) return m;
          const calculatedWinner =
            winnerCorner ||
            (m.redScore > m.blueScore
              ? "RED"
              : m.blueScore > m.redScore
              ? "BLUE"
              : undefined);
          const updated: Match = {
            ...m,
            status: "FINISHED" as const,
            timerStatus: "FINISHED" as const,
            timeRemainingSeconds: 0,
            winner: calculatedWinner,
            winReason: reason,
          };
          targetUpdated = updated;
          return updated;
        })
      );
      if (targetUpdated) broadcastMatchUpdate(targetUpdated);
    },
    [activeMatch.id, broadcastMatchUpdate]
  );

  /**
   * Petugas Gelanggang SAHKAN Putusan Skor (Approve & Add Points)
   */
  const verifyEvent = useCallback(
    (eventId: string) => {
      let feedback: LastFeedbackState | null = null;
      let targetUpdated: Match | null = null;

      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatch.id) return m;
          const targetEvt = m.events.find((e) => e.id === eventId);
          if (!targetEvt || targetEvt.status === "VERIFIED") return m;

          const points = targetEvt.points;
          const corner = targetEvt.corner;

          const updatedEvents = m.events.map((e) =>
            e.id === eventId
              ? { ...e, status: "VERIFIED" as const, verified: true }
              : e
          );

          const updated: Match = {
            ...m,
            redScore: corner === "RED" ? m.redScore + points : m.redScore,
            blueScore: corner === "BLUE" ? m.blueScore + points : m.blueScore,
            events: updatedEvents,
          };

          feedback = {
            corner: targetEvt.corner,
            action: targetEvt.action,
            points: targetEvt.points,
            timestamp: Date.now(),
            status: "VERIFIED",
            agreedJudges: targetEvt.judgesAgreed || [targetEvt.judgeNumber],
          };

          targetUpdated = updated;
          return updated;
        })
      );

      if (feedback) setLastFeedback(feedback);
      if (targetUpdated && feedback) broadcastMatchUpdate(targetUpdated, feedback);
    },
    [activeMatch.id, broadcastMatchUpdate]
  );

  /**
   * Petugas Gelanggang TOLAK Putusan Skor (Reject / Invalidate)
   */
  const rejectEvent = useCallback(
    (eventId: string) => {
      let feedback: LastFeedbackState | null = null;
      let targetUpdated: Match | null = null;

      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatch.id) return m;
          const eventToReject = m.events.find((e) => e.id === eventId);
          if (!eventToReject || eventToReject.status === "REJECTED") return m;

          const points = eventToReject.points;
          const corner = eventToReject.corner;
          const wasVerified = eventToReject.status === "VERIFIED";

          const updatedEvents = m.events.map((e) =>
            e.id === eventId
              ? { ...e, status: "REJECTED" as const, verified: false }
              : e
          );

          const updated: Match = {
            ...m,
            redScore:
              corner === "RED" && wasVerified
                ? Math.max(0, m.redScore - points)
                : m.redScore,
            blueScore:
              corner === "BLUE" && wasVerified
                ? Math.max(0, m.blueScore - points)
                : m.blueScore,
            events: updatedEvents,
          };

          feedback = {
            corner: eventToReject.corner,
            action: eventToReject.action,
            points: eventToReject.points,
            timestamp: Date.now(),
            status: "REJECTED",
            agreedJudges: eventToReject.judgesAgreed || [eventToReject.judgeNumber],
          };

          targetUpdated = updated;
          return updated;
        })
      );

      if (feedback) setLastFeedback(feedback);
      if (targetUpdated && feedback) broadcastMatchUpdate(targetUpdated, feedback);
    },
    [activeMatch.id, broadcastMatchUpdate]
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
