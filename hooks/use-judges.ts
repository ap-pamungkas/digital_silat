"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { Judge } from "@/lib/types";

export function useJudges(initialArenaId = "") {
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
    void Promise.resolve().then(fetchJudges);
  }, [fetchJudges]);

  const effectiveSelectedArena = judges.some((judge) => judge.arenaId === selectedArena)
    ? selectedArena
    : judges[0]?.arenaId ?? "";

  const arenaJudges = useMemo(() => {
    return judges.filter((j) => j.arenaId === effectiveSelectedArena);
  }, [judges, effectiveSelectedArena]);

  const onlineCount = useMemo(() => {
    return judges.filter((j) => j.status === "ONLINE").length;
  }, [judges]);

  return {
    judges,
    arenaJudges,
    selectedArena: effectiveSelectedArena,
    setSelectedArena,
    onlineCount,
    totalCount: judges.length,
    isLoading,
    error,
    refreshJudges: fetchJudges,
  };
}
