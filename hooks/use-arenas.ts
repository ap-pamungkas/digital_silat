"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { Arena } from "@/lib/types";

export function useArenas() {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchArenas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.arenas.list();
      if (Array.isArray(data)) {
        const unique = Array.from(new Map(data.map((item) => [item.id, item])).values());
        setArenas(unique);
      }
    } catch (err) {
      console.warn("Failed to fetch arenas from API:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchArenas);
  }, [fetchArenas]);

  return {
    arenas,
    isLoading,
    error,
    refreshArenas: fetchArenas,
  };
}
