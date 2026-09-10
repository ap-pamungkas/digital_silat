"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { Judge } from "@/lib/types";

export function useJudges(initialArenaId = "ARENA-01") {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [selectedArena, setSelectedArena] = useState<string>(initialArenaId);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJudges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.judges.list();
      if (Array.isArray(data)) {
        setJudges(data);
      }
    } catch (err) {
      console.warn("Failed to fetch judges from API:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJudges();
  }, [fetchJudges]);

  const arenaJudges = useMemo(() => {
    return judges.filter((j) => j.arenaId === selectedArena);
  }, [judges, selectedArena]);

  const onlineCount = useMemo(() => {
    return judges.filter((j) => j.status === "ONLINE").length;
  }, [judges]);

  return {
    judges,
    arenaJudges,
    selectedArena,
    setSelectedArena,
    onlineCount,
    totalCount: judges.length,
    isLoading,
    error,
    refreshJudges: fetchJudges,
  };
}
