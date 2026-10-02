"use client";

import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import {
  isMatchRealtimeEvent,
  matchChannelName,
  type MatchRealtimeEvent,
  type RealtimeStatus,
} from "./events";

/**
 * Browser side of the realtime bus.
 *
 * Only the publishable key is used here, so nothing privileged reaches the
 * client bundle. When Supabase is not configured the module reports
 * `UNAVAILABLE` and the app keeps its server-authoritative polling; it never
 * pretends to be connected.
 *
 * One channel per match is shared by every subscriber on the page so switching
 * between the judge, operator, and display views does not flap the socket.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null | undefined;

function getClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!supabaseUrl || !supabasePublishableKey) {
    client = null;
    return client;
  }
  client = createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    realtime: { params: { eventsPerSecond: 20 } },
  });
  return client;
}

export function isRealtimeConfigured(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export interface MatchSubscription {
  unsubscribe: () => void;
}

export interface SubscribeMatchOptions {
  onEvent: (event: MatchRealtimeEvent) => void;
  onStatus: (status: RealtimeStatus) => void;
}

interface MatchChannelEntry {
  channel: RealtimeChannel;
  status: RealtimeStatus;
  subscribers: Set<SubscribeMatchOptions>;
  ready: Promise<RealtimeChannel>;
}

const channels = new Map<string, MatchChannelEntry>();

function ensureChannel(matchId: string): MatchChannelEntry | null {
  const supabase = getClient();
  if (!supabase) return null;

  const existing = channels.get(matchId);
  if (existing) return existing;

  const subscribers = new Set<SubscribeMatchOptions>();
  const channel = supabase.channel(matchChannelName(matchId), {
    config: { broadcast: { self: false } },
  });

  const entry: MatchChannelEntry = {
    channel,
    status: "CONNECTING",
    subscribers,
    ready: Promise.resolve(channel),
  };

  channel
    .on("broadcast", { event: "message" }, ({ payload }) => {
      if (!isMatchRealtimeEvent(payload)) return;
      if (payload.matchId !== matchId) return;
      for (const subscriber of subscribers) subscriber.onEvent(payload);
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") entry.status = "LIVE";
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") entry.status = "RECONNECTING";
      else if (status === "CLOSED") entry.status = "OFFLINE";
      else return;
      for (const subscriber of subscribers) subscriber.onStatus(entry.status);
    });

  channels.set(matchId, entry);
  return entry;
}

export function subscribeMatch(
  matchId: string,
  options: SubscribeMatchOptions
): MatchSubscription {
  const entry = ensureChannel(matchId);
  if (!entry) {
    options.onStatus("UNAVAILABLE");
    return { unsubscribe: () => {} };
  }

  entry.subscribers.add(options);
  options.onStatus(entry.status);

  return {
    unsubscribe: () => {
      entry.subscribers.delete(options);
      if (entry.subscribers.size > 0) return;
      channels.delete(matchId);
      const supabase = getClient();
      if (supabase) void supabase.removeChannel(entry.channel);
    },
  };
}

/**
 * Publishes a snapshot that the server has already persisted. Returns false
 * when Supabase is unavailable or the send fails so the caller can keep the
 * safety poll running instead of reporting a false success.
 */
export async function publishMatchEvent(event: MatchRealtimeEvent): Promise<boolean> {
  const entry = ensureChannel(event.matchId);
  if (!entry) return false;

  try {
    await entry.ready;
    await entry.channel.send({ type: "broadcast", event: "message", payload: event });
    return true;
  } catch {
    return false;
  }
}