import type * as React from "react";
import { ScoringProvider } from "@/lib/scoring-store";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * Judge device area. Judges authenticate with the operator-generated access
 * code (verified into an HttpOnly device cookie), never with email/password,
 * so this layout performs no Supabase redirect. Write APIs remain the
 * authoritative server-side gate; pages add a client-side session check.
 */
export default function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScoringProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between transition-colors">
          <main className="flex-1 w-full max-w-lg md:max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
            {children}
          </main>
        </div>
      </ToastProvider>
    </ScoringProvider>
  );
}
