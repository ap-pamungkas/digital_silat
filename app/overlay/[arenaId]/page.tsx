"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { ScoringProvider, useScoring } from "@/lib/scoring-store";
import { formatTime, cn } from "@/lib/utils";

function ObsOverlayContent() {
  const params = useParams();
  const arenaId = typeof params?.arenaId === "string" ? params.arenaId : "";
  const { matches } = useScoring();

  const match =
    matches.find((item) => item.arenaId === arenaId && item.status === "LIVE") ||
    matches.find((item) => item.arenaId === arenaId && ["READY", "SCHEDULED"].includes(item.status)) ||
    matches.filter((item) => item.arenaId === arenaId).at(-1);

  if (!match) {
    return <div className="w-screen h-screen bg-transparent" />;
  }

  return (
    <div className="relative w-screen h-screen bg-transparent select-none p-6 flex flex-col justify-between font-sans">
      <div className="flex items-start justify-between">
        <div className="flex items-center rounded-lg bg-black/85 border border-white/10 text-white p-2">
          <div className="w-7 h-7 rounded-md bg-[#DC2626] flex items-center justify-center font-bold text-sm text-white mr-2">
            PS
          </div>
          <div className="pr-2">
            <div className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wide leading-tight">
              {match.tournamentName}
            </div>
            <div className="text-xs font-semibold uppercase text-white leading-tight">
              {match.arenaName} • <span className="text-[#93C5FD]">{match.category}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <div className="rounded-xl bg-black/90 border border-white/10 overflow-hidden">
          <div className="grid grid-cols-12 items-stretch">
            <div className="col-span-5 flex items-center justify-between bg-[#DC2626] text-white px-4 py-3">
              <div className="min-w-0 pr-2">
                <div className="text-[10px] font-bold text-white/75 uppercase tracking-wider">
                  {match.redAthlete.contingent}
                </div>
                <div className="text-sm sm:text-base font-bold truncate">
                  {match.redAthlete.name}
                </div>
              </div>
              <div className="font-mono font-bold text-3xl sm:text-4xl px-3 py-1 rounded-md bg-black/30 tabular-nums">
                {match.redScore}
              </div>
            </div>

            <div className="col-span-2 flex flex-col items-center justify-center bg-[#17191F] text-white border-x border-white/10 px-2 py-2 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                R{match.currentRound}
              </div>
              <div
                className={cn(
                  "font-mono font-bold text-base sm:text-xl leading-none my-0.5 tabular-nums",
                  match.timerStatus === "RUNNING"
                    ? "text-[#86EFAC]"
                    : match.timerStatus === "PAUSED"
                    ? "text-[#FCD34D]"
                    : "text-[#FCA5A5]"
                )}
              >
                {formatTime(match.timeRemainingSeconds)}
              </div>
              <div className="text-[8px] font-bold uppercase text-[#475569]">
                {match.status}
              </div>
            </div>

            <div className="col-span-5 flex items-center justify-between bg-[#2563EB] text-white px-4 py-3">
              <div className="font-mono font-bold text-3xl sm:text-4xl px-3 py-1 rounded-md bg-black/30 tabular-nums">
                {match.blueScore}
              </div>
              <div className="min-w-0 pl-2 text-right">
                <div className="text-[10px] font-bold text-white/75 uppercase tracking-wider">
                  {match.blueAthlete.contingent}
                </div>
                <div className="text-sm sm:text-base font-bold truncate">
                  {match.blueAthlete.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ObsOverlayPage() {
  return (
    <ScoringProvider>
      <ObsOverlayContent />
    </ScoringProvider>
  );
}
