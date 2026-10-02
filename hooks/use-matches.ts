"use client";

import { useState, useMemo, useCallback } from "react";
import { Match } from "@/lib/types";
import { apiClient, CreateMatchDto, UpdateMatchScheduleDto } from "@/lib/api/client";

export function useMatches(matches: Match[], onRefresh?: () => Promise<void>) {
  const [search, setSearch] = useState("");
  const [arenaFilter, setArenaFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchesSearch =
        m.matchNumber.toLowerCase().includes(search.toLowerCase()) ||
        m.redAthlete.name.toLowerCase().includes(search.toLowerCase()) ||
        m.blueAthlete.name.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase());
      const matchesArena = arenaFilter === "ALL" || m.arenaId === arenaFilter;
      const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
      return matchesSearch && matchesArena && matchesStatus;
    });
  }, [matches, search, arenaFilter, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: matches.length,
      live: matches.filter((m) => m.status === "LIVE").length,
      upcoming: matches.filter((m) => m.status === "SCHEDULED").length,
      finished: matches.filter((m) => m.status === "FINISHED").length,
    };
  }, [matches]);

  const createMatch = useCallback(
    async (payload: CreateMatchDto) => {
      setIsSubmitting(true);
      try {
        const data = await apiClient.matches.create(payload);
        if (onRefresh) await onRefresh();
        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onRefresh]
  );

  const updateMatchSchedule = useCallback(
    async (id: string, payload: UpdateMatchScheduleDto) => {
      setIsSubmitting(true);
      try {
        const result = await apiClient.matches.updateSchedule(id, payload);
        if (onRefresh) await onRefresh();
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onRefresh]
  );

  const deleteMatch = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        const result = await apiClient.matches.delete(id);
        if (onRefresh) await onRefresh();
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onRefresh]
  );

  return {
    filteredMatches,
    search,
    setSearch,
    arenaFilter,
    setArenaFilter,
    statusFilter,
    setStatusFilter,
    counts,
    isSubmitting,
    createMatch,
    updateMatchSchedule,
    deleteMatch,
  };
}
