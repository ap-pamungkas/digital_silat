"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { Tournament, Arena, Match, DEFAULT_TOURNAMENT } from "@/lib/types";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.dashboard.getOverview();
      if (data?.tournament) setTournament(data.tournament);
      if (data?.stats) setStats(data.stats);
      if (Array.isArray(data?.arenas)) setArenas(data.arenas);
      if (Array.isArray(data?.matches)) setMatches(data.matches);
    } catch (err) {
      console.warn("Failed to load dashboard overview:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    tournament,
    stats,
    arenas,
    matches,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}
