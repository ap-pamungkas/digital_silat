import { redirect } from "next/navigation";
import type * as React from "react";
import { ScoringProvider } from "@/lib/scoring-store";
import { ToastProvider } from "@/components/ui/Toast";
import { JUDGE_ROLES, getSessionUser } from "@/lib/auth/session";

export default async function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (!JUDGE_ROLES.includes(user.role)) {
    redirect(user.role === "OPERATOR" ? "/dashboard" : "/access-denied");
  }

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