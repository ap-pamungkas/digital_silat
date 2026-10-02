"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient, CreateAthleteDto } from "@/lib/api/client";
import { Athlete } from "@/lib/types";

export function useAthletes() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAthletes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.athletes.list();
      if (Array.isArray(data)) {
        setAthletes(data);
      }
    } catch (err) {
      console.warn("Failed to fetch athletes from API:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchAthletes);
  }, [fetchAthletes]);

  const filteredAthletes = useMemo(() => {
    return athletes.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.contingent.toLowerCase().includes(search.toLowerCase());
      const matchesGender = genderFilter === "ALL" || a.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [athletes, search, genderFilter]);

  const addAthlete = useCallback(
    async (data: CreateAthleteDto) => {
      setIsSubmitting(true);
      try {
        const created = await apiClient.athletes.create(data);
        await fetchAthletes();
        return created;
      } catch (err) {
        console.error("Error creating athlete:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchAthletes]
  );

  const updateAthlete = useCallback(
    async (id: string, data: CreateAthleteDto) => {
      setIsSubmitting(true);
      try {
        const updated = await apiClient.athletes.update(id, data);
        await fetchAthletes();
        return updated;
      } catch (err) {
        console.error("Error updating athlete:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchAthletes]
  );

  const deleteAthlete = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await apiClient.athletes.delete(id);
        await fetchAthletes();
      } catch (err) {
        console.error("Error deleting athlete:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchAthletes]
  );

  return {
    athletes,
    filteredAthletes,
    search,
    setSearch,
    genderFilter,
    setGenderFilter,
    isLoading,
    isSubmitting,
    error,
    addAthlete,
    updateAthlete,
    deleteAthlete,
    refreshAthletes: fetchAthletes,
  };
}
