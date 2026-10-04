"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Tv, Cast } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api/client";

const PUBLIC_SHORTCUTS = [
  {
    href: "/display/ARENA-01",
    label: "TV Display",
    icon: Tv,
    color: "text-emerald-700 dark:text-[#22C55E]",
  },
  {
    href: "/overlay/ARENA-01",
    label: "OBS Overlay",
    icon: Cast,
    color: "text-purple-700 dark:text-[#A855F7]",
  },
] as const;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const nextPath = searchParams.get("next");
  const authUnconfigured = searchParams.get("reason") === "auth-unconfigured";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.auth.login({ email, password });
      const fallback = result.user.role === "JUDGE" ? "/judge" : "/dashboard";
      router.push(nextPath && nextPath.startsWith("/") ? nextPath : fallback);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Tidak dapat masuk. Periksa koneksi Anda."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center max-w-xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Masuk
        </h2>
      </div>

      {authUnconfigured && (
        <p
          role="alert"
          className="rounded-lg border border-amber-300 dark:border-[#F59E0B]/40 bg-amber-50 dark:bg-[#F59E0B]/10 px-3 py-2 text-xs text-amber-800 dark:text-[#FCD34D]"
        >
          Konfigurasi autentikasi belum lengkap di server.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="operator@pagar.id"
          autoComplete="username"
          required
        />

        <Input
          label="Kata Sandi"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          minLength={8}
          required
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-300 dark:border-[#EF4444]/40 bg-red-50 dark:bg-[#EF4444]/10 px-3 py-2 text-xs text-red-700 dark:text-[#FCA5A5]"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-1"
        >
          Masuk
        </Button>
      </form>

      <div className="pt-5 border-t border-slate-200 dark:border-[#273649] space-y-2.5">
        <span className="text-[11px] text-slate-400 dark:text-[#64748B] font-medium block text-center">
          Layar Publik
        </span>

        <div className="grid grid-cols-2 gap-2">
          {PUBLIC_SHORTCUTS.map((shortcut) => (
            <a
              key={shortcut.href}
              href={shortcut.href}
              className="p-2.5 rounded-lg bg-white dark:bg-[#0d1c2f] hover:bg-slate-50 dark:hover:bg-[#1c2b3e] border border-slate-200 dark:border-[#273649] text-left transition-colors text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <shortcut.icon className={`w-4 h-4 shrink-0 ${shortcut.color}`} />
              <span className="text-slate-800 dark:text-[#d5e3fd]">{shortcut.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#051426] text-slate-900 dark:text-[#d5e3fd] flex flex-col lg:flex-row transition-colors">
      <div className="lg:w-1/2 bg-white dark:bg-[#0d1c2f] p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[#273649] relative overflow-hidden transition-colors">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 dark:bg-[#eab308] flex items-center justify-center font-black text-xl text-slate-950 dark:text-[#604700] shadow-xs">
              P
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-[#ffd165] leading-5">
                PAGAR
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-[#d3c5ac] uppercase tracking-wider font-medium">
                Sistem Scoring
              </p>
            </div>
          </div>

          <ThemeToggle />
        </div>

        <div className="relative z-10 my-auto py-12 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Digital Pencak Silat Scoring
          </h2>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8]">
            Platform turnamen real-time wasit juri & scoreboard
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400 dark:text-[#64748B] tabular-nums">
          PAGAR • Ale-Ale Edition
        </div>
      </div>

      <Suspense fallback={<div className="lg:w-1/2" aria-hidden="true" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
