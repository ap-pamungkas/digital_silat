"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Swords, Shield, Smartphone, Tv, Cast, ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("operator@digitalsilat.id");
  const [password, setPassword] = React.useState("••••••••");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const timeout = window.setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
    return () => window.clearTimeout(timeout);
  };

  const handleQuickRole = (role: "operator" | "judge" | "display" | "overlay") => {
    if (role === "operator") router.push("/dashboard");
    if (role === "judge") router.push("/judge");
    if (role === "display") router.push("/display/ARENA-01");
    if (role === "overlay") router.push("/overlay/ARENA-01");
  };

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

      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center max-w-xl mx-auto w-full space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-7">
            Masuk ke Sistem
          </h3>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
            Gunakan akun operator atau wasit juri untuk mengakses kontrol pertandingan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email atau Username"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@digitalsilat.id"
            required
          />

          <Input
            label="Kata Sandi (Password)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600 dark:text-[#94A3B8] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 bg-white dark:bg-[#17191F] border-slate-300 dark:border-[#2A2D36]"
              />
              <span>Ingat perangkat ini</span>
            </label>
            <a href="#" className="font-medium text-amber-600 dark:text-[#ffd165] hover:underline">
              Lupa sandi?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="pt-6 border-t border-slate-200 dark:border-[#273649] space-y-3">
          <div className="text-center">
            <span className="text-xs text-slate-400 dark:text-[#64748B] font-medium">
              Akses Cepat Peran Sistem (Demo Mode)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickRole("operator")}
              className="p-3 rounded-xl bg-white dark:bg-[#0d1c2f] hover:bg-slate-50 dark:hover:bg-[#1c2b3e] border border-slate-200 dark:border-[#273649] text-left transition-colors text-xs shadow-xs cursor-pointer"
            >
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-[#ffd165]" />
                Operator IT
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#64748B] mt-0.5">Kontrol Penuh Turnamen</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole("judge")}
              className="p-3 rounded-xl bg-white dark:bg-[#0d1c2f] hover:bg-slate-50 dark:hover:bg-[#1c2b3e] border border-slate-200 dark:border-[#273649] text-left transition-colors text-xs shadow-xs cursor-pointer"
            >
              <div className="font-bold text-amber-700 dark:text-[#ffd165] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                Juri Mobile
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#64748B] mt-0.5">Aplikasi Input Skor Juri</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole("display")}
              className="p-3 rounded-xl bg-white dark:bg-[#0d1c2f] hover:bg-slate-50 dark:hover:bg-[#1c2b3e] border border-slate-200 dark:border-[#273649] text-left transition-colors text-xs shadow-xs cursor-pointer"
            >
              <div className="font-bold text-emerald-700 dark:text-[#22C55E] flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5" />
                TV Display
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#64748B] mt-0.5">Layar Scoreboard Gelanggang</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole("overlay")}
              className="p-3 rounded-xl bg-white dark:bg-[#0d1c2f] hover:bg-slate-50 dark:hover:bg-[#1c2b3e] border border-slate-200 dark:border-[#273649] text-left transition-colors text-xs shadow-xs cursor-pointer"
            >
              <div className="font-bold text-purple-700 dark:text-[#A855F7] flex items-center gap-1.5">
                <Cast className="w-3.5 h-3.5" />
                OBS Overlay
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#64748B] mt-0.5">Grafis Live Stream 16:9</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
