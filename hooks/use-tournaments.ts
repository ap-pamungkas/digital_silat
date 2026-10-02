"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient, CreateTournamentDto } from "@/lib/api/client";
import { Tournament } from "@/lib/types";

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.tournaments.list();
      if (Array.isArray(data)) {
        setTournaments(data);
      }
    } catch (err) {
      console.warn("Failed to fetch tournaments from API:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchTournaments);
  }, [fetchTournaments]);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [tournaments, search]);

  const createTournament = useCallback(
    async (data: CreateTournamentDto) => {
      setIsSubmitting(true);
      try {
        const created = await apiClient.tournaments.create(data);
        await fetchTournaments();
        return created;
      } catch (err) {
        console.error("Error creating tournament:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchTournaments]
  );

  const updateTournament = useCallback(
    async (id: string, data: Partial<CreateTournamentDto>) => {
      setIsSubmitting(true);
      try {
        const updated = await apiClient.tournaments.update(id, data);
        await fetchTournaments();
        return updated;
      } catch (err) {
        console.error("Error updating tournament:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchTournaments]
  );

  const deleteTournament = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await apiClient.tournaments.delete(id);
        await fetchTournaments();
      } catch (err) {
        console.error("Error deleting tournament:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchTournaments]
  );

  return {
    tournaments,
    filteredTournaments,
    search,
    setSearch,
    isLoading,
    isSubmitting,
    error,
    createTournament,
    updateTournament,
    deleteTournament,
    refreshTournaments: fetchTournaments,
  };
}
