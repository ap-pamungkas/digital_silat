"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { Tournament, Arena, Match, DEFAULT_TOURNAMENT } from "@/lib/types";
import { DashboardResponse } from "@/lib/api/dashboard";

export interface DashboardStats {
  totalAthletes: number;
  totalMatches: number;
  finishedMatches: number;
  totalArenas: number;
  matchesToday: number;
}

export function useDashboard() {
  const [tournament, setTournament] = useState<Tournament>(DEFAULT_TOURNAMENT);
  const [stats, setStats] = useState<DashboardStats>({
    totalAthletes: 0,
    totalMatches: 0,
    finishedMatches: 0,
    totalArenas: 0,
    matchesToday: 0,
  });
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [auditLogs, setAuditLogs] = useState<DashboardResponse["auditLogs"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await apiClient.dashboard.getOverview();
      setError(null);
      setTournament(data?.tournament ?? DEFAULT_TOURNAMENT);
      if (data?.stats) setStats(data.stats);
      if (Array.isArray(data?.arenas)) setArenas(data.arenas);
      if (Array.isArray(data?.matches)) setMatches(data.matches);
      setActiveMatch(data?.activeMatch ?? null);
      if (Array.isArray(data?.auditLogs)) setAuditLogs(data.auditLogs);
    } catch (err) {
      console.warn("Failed to load dashboard overview:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchDashboardData);
  }, [fetchDashboardData]);

  return {
    tournament,
    stats,
    arenas,
    matches,
    activeMatch,
    auditLogs,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}
