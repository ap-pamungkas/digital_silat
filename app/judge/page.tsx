"use client";

import * as React from "react";
import Link from "next/link";
import { useScoring } from "@/lib/scoring-store";
import { JudgeStatus } from "@/components/judge/JudgeStatus";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Battery, ArrowRight, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JudgeHomePage() {
  const { activeMatch, currentJudgeNumber, setCurrentJudgeNumber } = useScoring();

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 dark:bg-[#273649] dark:text-[#ffd165] dark:border-[#4f4633] flex items-center justify-center font-bold tabular-nums text-base shrink-0 shadow-xs">
            J{currentJudgeNumber}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white leading-5">
              Juri {currentJudgeNumber}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8]">
              {activeMatch.arenaName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 dark:bg-[#22C55E]/10 dark:text-[#86EFAC] px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-[#22C55E]/25 tabular-nums font-semibold">
            <Battery className="w-3.5 h-3.5" />
            <span>94%</span>
          </div>
          <JudgeStatus status="ONLINE" pingMs={18} showText={false} />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] space-y-3 shadow-xs transition-colors">
        <label className="block text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
          Pilih Posisi Wasit Juri Anda
        </label>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((num) => {
            const isSelected = currentJudgeNumber === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setCurrentJudgeNumber(num)}
                className={cn(
                  "py-3 rounded-xl border font-semibold text-sm transition-all flex flex-col items-center justify-center leading-4 cursor-pointer",
                  isSelected
                    ? "bg-amber-500 text-slate-950 border-amber-500 dark:bg-[#ffd165] dark:text-[#604700] shadow-xs"
                    : "bg-slate-50 dark:bg-[#1F232C] text-slate-600 dark:text-[#94A3B8] border-slate-200 dark:border-[#2A2D36] hover:bg-slate-100 dark:hover:bg-[#272C37]"
                )}
              >
                <span className="text-[10px] opacity-75 uppercase">Juri</span>
                <span className="text-base sm:text-lg tabular-nums mt-0.5 font-bold">{num}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeMatch.id === "NO_MATCH" ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-[#273649] text-amber-600 dark:text-[#ffd165] flex items-center justify-center mx-auto font-bold text-lg">
            J{currentJudgeNumber}
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Menunggu Pertandingan</h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] max-w-xs mx-auto">
            Operator gelanggang belum mengaktifkan partai tanding. Scoring pad akan otomatis terhubung saat pertandingan dimulai.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-5 space-y-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273649] pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="live" size="sm">
                Partai Aktif
              </Badge>
              <span className="text-xs text-slate-800 dark:text-white font-bold tabular-nums">
                {activeMatch.arenaName}
              </span>
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-[#ffd165] tabular-nums">
              {activeMatch.matchNumber}
            </span>
          </div>

          <div className="text-center">
            <div className="text-xs font-bold text-amber-600 dark:text-[#ffd165]">
              {activeMatch.stage}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 leading-6">
              {activeMatch.category}
            </h2>
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl bg-red-600 text-white flex items-center justify-between min-w-0 shadow-xs">
              <div className="pr-2 min-w-0">
                <div className="text-[10px] font-bold text-white/80 uppercase tracking-wide">Sudut Merah</div>
                <div className="text-sm sm:text-base font-bold truncate leading-5">
                  {activeMatch.redAthlete.name}
                </div>
                <div className="text-xs text-white/80">
                  {activeMatch.redAthlete.contingent}
                </div>
              </div>
              <div className="font-mono font-bold text-3xl tabular-nums">
                {activeMatch.redScore}
              </div>
            </div>

            <div className="text-center text-xs text-slate-400 dark:text-[#64748B] tabular-nums font-semibold">
              — vs —
            </div>

            <div className="p-3.5 rounded-xl bg-blue-600 text-white flex items-center justify-between min-w-0 shadow-xs">
              <div className="pr-2 min-w-0">
                <div className="text-[10px] font-bold text-white/80 uppercase tracking-wide">Sudut Biru</div>
                <div className="text-sm sm:text-base font-bold truncate leading-5">
                  {activeMatch.blueAthlete.name}
                </div>
                <div className="text-xs text-white/80">
                  {activeMatch.blueAthlete.contingent}
                </div>
              </div>
              <div className="font-mono font-bold text-3xl tabular-nums">
                {activeMatch.blueScore}
              </div>
            </div>
          </div>

          <div className="pt-1">
            <Link href={`/judge/scoring/${activeMatch.id}`} className="block w-full">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-base sm:text-lg h-14"
              >
                <span>Masuk Ke Penilaian Partai</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="pt-1 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-[#64748B] dark:hover:text-[#94A3B8] transition-colors"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Kembali ke Operator Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
