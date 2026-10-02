"use client";

import * as React from "react";
import type { MatchRealtimeEvent, RealtimeStatus } from "@/lib/realtime/events";
import { subscribeMatch } from "@/lib/realtime/supabase-client";

/**
 * Subscribes to the realtime bus of a single match. The returned status is the
 * honest transport state: `UNAVAILABLE` when Supabase is not configured so the
 * UI can show that it is running on the polling fallback.
 */
export function useMatchRealtime(
  matchId: string | null | undefined,
  onEvent: (event: MatchRealtimeEvent) => void
): RealtimeStatus {
  const [status, setStatus] = React.useState<RealtimeStatus>("CONNECTING");
  const onEventRef = React.useRef(onEvent);

  React.useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  React.useEffect(() => {
    if (!matchId) return;

    const subscription = subscribeMatch(matchId, {
      onEvent: (event) => onEventRef.current(event),
      onStatus: setStatus,
    });

    return () => subscription.unsubscribe();
  }, [matchId]);

  return status;
}