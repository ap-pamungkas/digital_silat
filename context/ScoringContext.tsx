"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from "react";
import { Match, ScoreEvent, Corner, ScoringAction, PenaltyType, PenaltyRecord, DEFAULT_MATCH } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { apiClient } from "@/lib/api";

export interface LastFeedbackState {
  corner: Corner;
  action: ScoringAction;
  points: number;
  timestamp: number;
}

export interface ScoringContextType {
  matches: Match[];
  activeMatch: Match;
  currentJudgeNumber: number;
  setCurrentJudgeNumber: (num: number) => void;
  submitScore: (corner: Corner, action: ScoringAction, points: number) => void;
  applyPenalty: (corner: Corner, type: PenaltyType, points: number, note?: string) => void;
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
}

const ScoringContext = createContext<ScoringContextType | null>(null);

export function ScoringProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string>("");
  const [currentJudgeNumber, setCurrentJudgeNumber] = useState<number>(1);
  const [lastFeedback, setLastFeedback] = useState<LastFeedbackState | null>(null);
  const [, startTransition] = useTransition();

  const refreshMatches = useCallback(async () => {
    try {
      const data = await apiClient.matches.list();
      if (Array.isArray(data)) {
        setMatches(data);
        if (data.length > 0) {
          const liveMatch = data.find((m: Match) => m.status === "LIVE");
          setActiveMatchId(liveMatch ? liveMatch.id : data[0].id);
        }
      }
    } catch (err) {
      console.warn("Error fetching matches:", err);
    }
  }, []);

  // Load matches from API on mount
  useEffect(() => {
    refreshMatches();
  }, [refreshMatches]);

  const activeMatch = matches.find((m) => m.id === activeMatchId) || matches[0] || DEFAULT_MATCH;

  // Timer Tick Simulation when RUNNING
  useEffect(() => {
    if (activeMatch.timerStatus !== "RUNNING") return;

    const interval = setInterval(() => {
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatchId || m.timerStatus !== "RUNNING") return m;
          if (m.timeRemainingSeconds <= 1) {
            return {
              ...m,
              timeRemainingSeconds: 0,
              timerStatus: "FINISHED" as const,
            };
          }
          return {
            ...m,
            timeRemainingSeconds: m.timeRemainingSeconds - 1,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMatch.timerStatus, activeMatchId]);

  const submitScore = useCallback(
    (corner: Corner, action: ScoringAction, points: number) => {
      const matchTimeStr = formatTime(activeMatch.timeRemainingSeconds);
      const newEvent: ScoreEvent = {
        id: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        matchId: activeMatch.id,
        judgeId: `JURI-${currentJudgeNumber}`,
        judgeNumber: currentJudgeNumber,
        corner,
        action,
        points,
        round: activeMatch.currentRound,
        matchTime: matchTimeStr,
        timestamp: Date.now(),
        verified: true,
        status: "VERIFIED",
      };

      startTransition(() => {
        setLastFeedback({ corner, action, points, timestamp: Date.now() });

        setMatches((prev) =>
          prev.map((m) => {
            if (m.id !== activeMatch.id) return m;
            return {
              ...m,
              redScore: corner === "RED" ? m.redScore + points : m.redScore,
              blueScore: corner === "BLUE" ? m.blueScore + points : m.blueScore,
              events: [newEvent, ...m.events],
            };
          })
        );
      });
    },
    [activeMatch, currentJudgeNumber]
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

      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatch.id) return m;
          const updatedRedScore = corner === "RED" ? Math.max(0, m.redScore - points) : m.redScore;
          const updatedBlueScore = corner === "BLUE" ? Math.max(0, m.blueScore - points) : m.blueScore;
          return {
            ...m,
            redScore: updatedRedScore,
            blueScore: updatedBlueScore,
            redPenalties: corner === "RED" ? [...m.redPenalties, newPenalty] : m.redPenalties,
            bluePenalties: corner === "BLUE" ? [...m.bluePenalties, newPenalty] : m.bluePenalties,
          };
        })
      );
    },
    [activeMatch]
  );

  const toggleTimer = useCallback(() => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatch.id) return m;
        const newStatus = m.timerStatus === "RUNNING" ? ("PAUSED" as const) : ("RUNNING" as const);
        return {
          ...m,
          timerStatus: newStatus,
          status: newStatus === "RUNNING" ? ("LIVE" as const) : ("PAUSED" as const),
        };
      })
    );
  }, [activeMatch.id]);

  const resetTimer = useCallback(() => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatch.id) return m;
        return {
          ...m,
          timeRemainingSeconds: m.roundDurationSeconds,
          timerStatus: "READY" as const,
          status: "PAUSED" as const,
        };
      })
    );
  }, [activeMatch.id]);

  const setRound = useCallback(
    (round: number) => {
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatch.id) return m;
          return {
            ...m,
            currentRound: round,
            timeRemainingSeconds: m.roundDurationSeconds,
            timerStatus: "READY" as const,
          };
        })
      );
    },
    [activeMatch.id]
  );

  const nextRound = useCallback(() => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatch.id) return m;
        const nextR = Math.min(m.totalRounds, m.currentRound + 1);
        return {
          ...m,
          currentRound: nextR,
          timeRemainingSeconds: m.roundDurationSeconds,
          timerStatus: "READY" as const,
        };
      })
    );
  }, [activeMatch.id]);

  const endMatch = useCallback(
    (winnerCorner?: Corner, reason = "KEPUTUSAN JURI / WASIT") => {
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatch.id) return m;
          const calculatedWinner =
            winnerCorner || (m.redScore > m.blueScore ? "RED" : m.blueScore > m.redScore ? "BLUE" : undefined);
          return {
            ...m,
            status: "FINISHED" as const,
            timerStatus: "FINISHED" as const,
            timeRemainingSeconds: 0,
            winner: calculatedWinner,
            winReason: reason,
          };
        })
      );
    },
    [activeMatch.id]
  );

  const verifyEvent = useCallback(
    (eventId: string) => {
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatch.id) return m;
          return {
            ...m,
            events: m.events.map((e) => (e.id === eventId ? { ...e, status: "VERIFIED" as const, verified: true } : e)),
          };
        })
      );
    },
    [activeMatch.id]
  );

  const rejectEvent = useCallback(
    (eventId: string) => {
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatch.id) return m;
          const eventToReject = m.events.find((e) => e.id === eventId);
          if (!eventToReject || eventToReject.status === "REJECTED") return m;

          const points = eventToReject.points;
          const corner = eventToReject.corner;

          return {
            ...m,
            redScore: corner === "RED" ? Math.max(0, m.redScore - points) : m.redScore,
            blueScore: corner === "BLUE" ? Math.max(0, m.blueScore - points) : m.blueScore,
            events: m.events.map((e) => (e.id === eventId ? { ...e, status: "REJECTED" as const, verified: false } : e)),
          };
        })
      );
    },
    [activeMatch.id]
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
