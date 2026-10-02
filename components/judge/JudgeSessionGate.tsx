"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";

/**
 * Client-side gate for judge device pages. The authoritative check lives in
 * the score/penalty APIs (server side); this only keeps the UX honest by
 * sending devices without a verified access code back to the entry page.
 */
export function JudgeSessionGate({
  matchId,
  children,
}: {
  matchId?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    apiClient.judgeSessions
      .me()
      .then((session) => {
        if (cancelled) return;
        if (matchId && session.matchId !== matchId) {
          router.replace("/judge");
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/judge");
      });
    return () => {
      cancelled = true;
    };
  }, [matchId, router]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-md py-12 text-center text-sm text-slate-500 dark:text-[#94A3B8]">
        Memeriksa sesi juri…
      </div>
    );
  }

  return <>{children}</>;
}
