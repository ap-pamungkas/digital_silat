"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Swords, Shield, Tv, Cast, ArrowRight } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api/client";

const PUBLIC_SHORTCUTS = [
  {
    href: "/display/ARENA-01",
    label: "TV Display",
    description: "Layar Scoreboard Gelanggang",
    icon: Tv,
    color: "text-emerald-700 dark:text-[#22C55E]",
  },
  {
    href: "/overlay/ARENA-01",
    label: "OBS Overlay",
    description: "Grafis Live Stream 16:9",
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
    <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center max-w-xl mx-auto w-full space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-7">
          Masuk ke Sistem
        </h3>
        <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
          Gunakan akun operator atau wasit juri untuk mengakses kontrol pertandingan
        </p>
      </div>

      {authUnconfigured && (
        <p
          role="alert"
          className="rounded-lg border border-amber-300 dark:border-[#F59E0B]/40 bg-amber-50 dark:bg-[#F59E0B]/10 px-3 py-2.5 text-sm text-amber-800 dark:text-[#FCD34D]"
        >
          Autentikasi belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY pada server.
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
          label="Kata Sandi (Password)"
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
            className="rounded-lg border border-red-300 dark:border-[#EF4444]/40 bg-red-50 dark:bg-[#EF4444]/10 px-3 py-2.5 text-sm text-red-700 dark:text-[#FCA5A5]"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          <span>Masuk</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <div className="pt-6 border-t border-slate-200 dark:border-[#273649] space-y-3">
        <div className="text-center">
          <span className="text-xs text-slate-400 dark:text-[#64748B] font-medium">
            Layar Publik (tanpa login)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {PUBLIC_SHORTCUTS.map((shortcut) => (
            <a
              key={shortcut.href}
              href={shortcut.href}
              className="p-3 rounded-xl bg-white dark:bg-[#0d1c2f] hover:bg-slate-50 dark:hover:bg-[#1c2b3e] border border-slate-200 dark:border-[#273649] text-left transition-colors text-xs shadow-xs"
            >
              <div className={`font-bold flex items-center gap-1.5 ${shortcut.color}`}>
                <shortcut.icon className="w-3.5 h-3.5" />
                {shortcut.label}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#64748B] mt-0.5">
                {shortcut.description}
              </div>
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
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 dark:bg-[#eab308] flex items-center justify-center font-black text-xl text-slate-950 dark:text-[#604700] shadow-xs">
              P
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-[#ffd165] leading-5">
                PAGAR
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-[#d3c5ac] uppercase tracking-wider font-medium">
                Ale-Ale Edition
              </p>
            </div>
          </div>

          <ThemeToggle />
        </div>

        <div className="relative z-10 my-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-[#eab308]/15 text-amber-700 dark:text-[#ffd165] border border-amber-300 dark:border-[#ffd165]/35 text-xs font-bold shadow-xs">
            <Shield className="w-3.5 h-3.5" />
            Standar Resmi Wasit Juri Persilat / IPSI
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Sistem Penilaian Digital Pencak Silat
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-[#d3c5ac] leading-relaxed max-w-lg">
            Platform kompetisi pencak silat profesional dengan kontrol penilaian 5 wasit juri,
            sinkronisasi skor waktu nyata, display TV scoreboard, dan integrasi broadcast OBS HUD.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-[#273649] max-w-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1F232C] border border-slate-200 dark:border-[#2A2D36] text-emerald-600 dark:text-[#22C55E]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">5 Juri Konsensus</div>
                <div className="text-xs text-slate-500 dark:text-[#64748B]">Validasi Cepat 1s</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1F232C] border border-slate-200 dark:border-[#2A2D36] text-amber-600 dark:text-[#ffd165]">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Multi Gelanggang</div>
                <div className="text-xs text-slate-500 dark:text-[#64748B]">Arena A - C Simultan</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 dark:text-[#64748B] tabular-nums">
          © 2026 PAGAR • Kejuaraan Silat Ale-Ale Ketapang
        </div>
      </div>

      <Suspense fallback={<div className="lg:w-1/2" aria-hidden="true" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
