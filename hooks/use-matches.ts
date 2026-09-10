"use client";

import { useState, useMemo, useCallback } from "react";
import { Match } from "@/lib/types";

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
      upcoming: matches.filter((m) => m.status === "UPCOMING" || m.status === "SCHEDULED").length,
      finished: matches.filter((m) => m.status === "FINISHED").length,
    };
  }, [matches]);

  const createMatch = useCallback(
    async (payload: {
      arenaId: string;
      matchNumber: string;
      redAthleteId: string;
      blueAthleteId: string;
      categoryName?: string;
      stage?: "PENYISIHAN" | "PEREMPAT_FINAL" | "SEMI_FINAL" | "FINAL" | "PEREBUTAN_JUARA_3";
      scheduledTime?: string;
    }) => {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal membuat partai pertandingan");
        }
        const data = await res.json();
        if (onRefresh) await onRefresh();
        return data;
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
  };
}
