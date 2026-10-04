import * as React from "react";
import Link from "next/link";
import {
  Smartphone,
  LayoutDashboard,
  Tv,
  Cast,
  Layers,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getDashboardData } from "@/lib/data-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { tournament, arenas, matches } = await getDashboardData();
  const activeArenaCount = arenas.filter((arena) => arena.status === "ACTIVE").length;
  const firstArena = arenas[0];

  return (
    <div className="min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col selection:bg-amber-500 selection:text-white dark:selection:bg-[#eab308] dark:selection:text-[#604700] transition-colors">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-[#273649] sticky top-0 z-30 bg-white/95 dark:bg-[#051426]/95 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 dark:bg-[#eab308] flex items-center justify-center font-black text-sm text-slate-950 dark:text-[#604700] shadow-xs">
              P
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-[#ffd165] tracking-tight">
                PAGAR
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-[#d3c5ac] uppercase tracking-wider font-medium">
                Scoring System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-[#0d1c2f] dark:hover:bg-[#1c2b3e] text-xs text-slate-700 dark:text-[#d3c5ac] hover:text-slate-900 dark:hover:text-[#d5e3fd] border border-slate-200 dark:border-[#273649] transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              href="/judge"
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 dark:bg-[#eab308] dark:hover:bg-[#f7be1d] text-xs text-slate-950 dark:text-[#604700] transition-colors font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Juri</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 sm:py-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#d5e3fd] leading-tight">
            Digital Pencak Silat Scoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94a3b8] mt-2">
            {tournament?.name ? `${tournament.name} • ${tournament.location}` : "Platform turnamen wasit juri & scoreboard"}
          </p>
        </div>

        {/* 4 Navigation Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-10">
          <Link
            href="/judge"
            className="group rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-4 flex flex-col transition-all hover:border-amber-400 dark:hover:border-[#ffd165]/50 shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-[#273649] text-amber-600 dark:text-[#ffd165] flex items-center justify-center mb-3 border border-amber-200/60 dark:border-[#4f4633]/40">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#d5e3fd]">
              Portal Juri
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-[#94a3b8] mt-0.5">
              Skor Mobile
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="group rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-4 flex flex-col transition-all hover:border-amber-400 dark:hover:border-[#ffd165]/50 shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-[#273649] text-amber-600 dark:text-[#ffd165] flex items-center justify-center mb-3 border border-amber-200/60 dark:border-[#4f4633]/40">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#d5e3fd]">
              Operator Dashboard
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-[#94a3b8] mt-0.5">
              Kendali Partai & Timer
            </span>
          </Link>

          <Link
            href={firstArena ? `/display/${firstArena.id}` : "/arenas"}
            target="_blank"
            className="group rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-4 flex flex-col transition-all hover:border-emerald-400 dark:hover:border-[#4ade80]/50 shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-[#273649] text-emerald-600 dark:text-[#4ade80] flex items-center justify-center mb-3 border border-emerald-200/60 dark:border-[#166534]/40">
              <Tv className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#d5e3fd]">
              Scoreboard TV
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-[#94a3b8] mt-0.5">
              Layar Gelanggang 16:9
            </span>
          </Link>

          <Link
            href={firstArena ? `/overlay/${firstArena.id}` : "/arenas"}
            target="_blank"
            className="group rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-4 flex flex-col transition-all hover:border-purple-400 dark:hover:border-[#c084fc]/50 shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-[#273649] text-purple-600 dark:text-[#c084fc] flex items-center justify-center mb-3 border border-purple-200/60 dark:border-[#7e22ce]/40">
              <Cast className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#d5e3fd]">
              OBS Overlay
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-[#94a3b8] mt-0.5">
              HUD Live Stream
            </span>
          </Link>
        </div>

        {/* Arena Direct Access */}
        <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#273649] pb-3 mb-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600 dark:text-[#ffd165]" />
              Gelanggang
            </h3>
            <span className="text-xs text-emerald-700 dark:text-[#4ade80] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-[#14532d]/40 rounded border border-emerald-200 dark:border-[#166534]">
              {activeArenaCount} Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {arenas.map((arena) => {
              const match = matches.find((item) => item.id === arena.currentMatchId) ||
                matches.find((item) => item.arenaId === arena.id && item.status === "LIVE") ||
                matches.find((item) => item.arenaId === arena.id && ["READY", "SCHEDULED"].includes(item.status));

              return (
                <div
                  key={arena.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#122033] border border-slate-200 dark:border-[#273649] flex flex-col justify-between"
                >
                  <div className="mb-2.5">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#d5e3fd]">{arena.name}</div>
                    <div className="text-[11px] text-amber-700 dark:text-[#ffd165] font-medium mt-0.5">
                      {match ? `${match.matchNumber} (${match.category})` : "Standby"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <Link
                      href={`/display/${arena.id}`}
                      target="_blank"
                      className="py-1.5 px-2 rounded-md bg-white hover:bg-slate-100 dark:bg-[#273649] dark:hover:bg-[#1c2b3e] text-emerald-700 dark:text-[#4ade80] border border-slate-200 dark:border-[#273649] text-center font-semibold transition-colors text-xs"
                    >
                      TV
                    </Link>
                    <Link
                      href={`/overlay/${arena.id}`}
                      target="_blank"
                      className="py-1.5 px-2 rounded-md bg-white hover:bg-slate-100 dark:bg-[#273649] dark:hover:bg-[#1c2b3e] text-purple-700 dark:text-[#c084fc] border border-slate-200 dark:border-[#273649] text-center font-semibold transition-colors text-xs"
                    >
                      OBS
                    </Link>
                  </div>
                </div>
              );
            })}
            {arenas.length === 0 ? (
              <p className="col-span-full py-6 text-center text-xs text-slate-500 dark:text-[#94a3b8]">
                Belum ada data gelanggang.
              </p>
            ) : null}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-[#273649] py-4 px-6 text-center text-xs text-slate-500 dark:text-[#94a3b8] transition-colors">
        PAGAR • Digital Pencak Silat Scoring System
      </footer>
    </div>
  );
}
