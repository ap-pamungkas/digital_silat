"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient, CreateJudgeDto, UpdateJudgeDto } from "@/lib/api";
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

  const addJudge = useCallback(async (data: CreateJudgeDto) => {
    const judge = await apiClient.judges.create(data);
    await fetchJudges();
    return judge;
  }, [fetchJudges]);

  const updateJudge = useCallback(async (id: string, data: UpdateJudgeDto) => {
    const updated = await apiClient.judges.update(id, data);
    await fetchJudges();
    return updated;
  }, [fetchJudges]);

  const deleteJudge = useCallback(async (id: string) => {
    await apiClient.judges.delete(id);
    await fetchJudges();
  }, [fetchJudges]);

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
    addJudge,
    updateJudge,
    deleteJudge,
  };
}
