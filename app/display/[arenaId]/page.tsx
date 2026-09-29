"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { ScoringProvider, useScoring } from "@/lib/scoring-store";
import { formatTime, cn } from "@/lib/utils";
import { Trophy, ShieldCheck } from "lucide-react";

function DisplayScoreboardContent() {
  const params = useParams();
  const arenaId = typeof params?.arenaId === "string" ? params.arenaId : "";
  const { matches } = useScoring();

  const match =
    matches.find((item) => item.arenaId === arenaId && item.status === "LIVE") ||
    matches.find((item) => item.arenaId === arenaId && ["READY", "SCHEDULED"].includes(item.status)) ||
    matches.filter((item) => item.arenaId === arenaId).at(-1);

  if (!match) {
    return (
      <main className="min-h-screen bg-[#0F1115] text-white flex items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-bold">Belum ada pertandingan di gelanggang ini</h1>
          <p className="mt-2 text-sm text-slate-400">Data scoreboard akan muncul setelah pertandingan tersedia di database.</p>
        </div>
      </main>
    );
  }

  const isRedWinner = match.status === "FINISHED" && match.winner === "RED";
  const isBlueWinner = match.status === "FINISHED" && match.winner === "BLUE";

  return (
    <div className="min-h-screen w-full bg-[#0F1115] text-white flex flex-col p-6 sm:p-8 lg:p-12 select-none">
      <header className="flex items-center justify-between border-b border-[#2A2D36] pb-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#DC2626] flex items-center justify-center font-bold text-2xl sm:text-3xl text-white">
            PS
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#F59E0B] uppercase tracking-wide">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{match.tournamentName}</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mt-0.5">
              {match.arenaName} • {match.matchNumber}
            </h1>
          </div>
        </div>

        <div className="text-right">
          <div className="text-base sm:text-xl font-bold text-[#93C5FD]">
            {match.category}
          </div>
          <div className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            {match.stage}
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-11 gap-4 sm:gap-6 my-auto items-stretch">
        <div
          className={cn(
            "lg:col-span-5 rounded-2xl border-4 p-6 sm:p-10 flex flex-col justify-between",
            isRedWinner
              ? "border-[#F59E0B] bg-gradient-to-br from-[#DC2626]/30 to-[#17191F]"
              : "border-[#DC2626] bg-[#17191F]"
          )}
        >
          <div className="flex items-center justify-between border-b border-[#DC2626]/40 pb-4">
            <div className="flex items-center gap-2 text-sm sm:text-lg font-bold text-[#FCA5A5] uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              Sudut Merah
            </div>
            {match.redAthlete.contingentCode && (
              <span className="font-bold text-sm sm:text-lg bg-[#991B1B]/60 px-3 py-1 rounded-lg border border-[#DC2626]/50 text-white tabular-nums">
                {match.redAthlete.contingentCode}
              </span>
            )}
          </div>

          <div className="my-6 sm:my-8">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              {match.redAthlete.name}
            </h2>
            <p className="text-lg sm:text-xl font-medium text-[#FCA5A5] mt-2">
              {match.redAthlete.contingent}
            </p>
          </div>

          <div className="flex items-end justify-between pt-4 border-t border-[#DC2626]/40">
            <div className="text-xs sm:text-sm font-medium text-[#FCA5A5]/80">
              {match.redPenalties.length > 0
                ? `${match.redPenalties.length} Hukuman`
                : "Poin Resmi"}
            </div>
            <div className="font-mono font-bold text-7xl sm:text-8xl lg:text-[120px] leading-none text-white tabular-nums">
              {match.redScore}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col items-center justify-center py-4 space-y-6">
          <div className="text-center font-bold text-sm sm:text-lg text-[#64748B] uppercase tracking-wider bg-[#17191F] px-4 py-3 rounded-xl border border-[#2A2D36]">
            Babak
            <div className="text-2xl sm:text-4xl text-white font-bold mt-0.5 tabular-nums">
              {match.currentRound} / {match.totalRounds}
            </div>
          </div>

          <div
            className={cn(
              "font-mono font-bold text-4xl sm:text-6xl px-5 py-3 rounded-2xl border-2 text-center tabular-nums",
              match.timerStatus === "RUNNING"
                ? "bg-[#17191F] text-white border-[#22C55E]/50"
                : match.timerStatus === "PAUSED"
                ? "bg-[#17191F] text-[#FCD34D] border-[#F59E0B]/50"
                : "bg-[#DC2626]/10 text-[#FCA5A5] border-[#DC2626]/50"
            )}
          >
            {formatTime(match.timeRemainingSeconds)}
          </div>

          <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#475569]">
            {match.status === "LIVE" ? "Sedang Bertanding" : match.status}
          </div>
        </div>

        <div
          className={cn(
            "lg:col-span-5 rounded-2xl border-4 p-6 sm:p-10 flex flex-col justify-between",
            isBlueWinner
              ? "border-[#F59E0B] bg-gradient-to-bl from-[#2563EB]/30 to-[#17191F]"
              : "border-[#2563EB] bg-[#17191F]"
          )}
        >
          <div className="flex items-center justify-between border-b border-[#2563EB]/40 pb-4">
            {match.blueAthlete.contingentCode && (
              <span className="font-bold text-sm sm:text-lg bg-[#1E40AF]/60 px-3 py-1 rounded-lg border border-[#2563EB]/50 text-white tabular-nums">
                {match.blueAthlete.contingentCode}
              </span>
            )}
            <div className="flex items-center gap-2 text-sm sm:text-lg font-bold text-[#93C5FD] uppercase tracking-wider">
              Sudut Biru
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            </div>
          </div>

          <div className="my-6 sm:my-8 text-right">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              {match.blueAthlete.name}
            </h2>
            <p className="text-lg sm:text-xl font-medium text-[#93C5FD] mt-2">
              {match.blueAthlete.contingent}
            </p>
          </div>

          <div className="flex items-end justify-between pt-4 border-t border-[#2563EB]/40">
            <div className="font-mono font-bold text-7xl sm:text-8xl lg:text-[120px] leading-none text-white tabular-nums">
              {match.blueScore}
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#93C5FD]/80 text-right">
              {match.bluePenalties.length > 0
                ? `${match.bluePenalties.length} Hukuman`
                : "Poin Resmi"}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#2A2D36] pt-6 flex flex-wrap items-center justify-between text-xs sm:text-sm text-[#64748B] gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#86EFAC]" />
          <span>Sistem Skor Digital Persilat / IPSI</span>
        </div>

        {match.status === "FINISHED" && (
          <div className="font-bold text-base sm:text-xl text-[#FCD34D] uppercase bg-[#F59E0B]/10 px-4 py-2 rounded-lg border border-[#F59E0B]/30">
            Hasil Akhir: {match.winReason || (isRedWinner ? "Sudut Merah Menang" : "Sudut Biru Menang")}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span>5 Wasit Juri</span>
          <span className="text-[#334155]">•</span>
          <span className="text-[#86EFAC] font-medium">Realtime</span>
        </div>
      </footer>
    </div>
  );
}

export default function DisplayArenaPage() {
  return (
    <ScoringProvider>
      <DisplayScoreboardContent />
    </ScoringProvider>
  );
}
