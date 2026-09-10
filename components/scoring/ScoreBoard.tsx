"use client";

import * as React from "react";
import { Match } from "@/lib/types";
import { MatchTimer } from "./MatchTimer";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface ScoreBoardProps {
  match: Match;
  size?: "sm" | "md" | "lg" | "display";
  showTimer?: boolean;
  className?: string;
}

export function ScoreBoard({
  match,
  size = "md",
  showTimer = true,
  className,
}: ScoreBoardProps) {
  const isDisplay = size === "display";

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-4 sm:p-5 shadow-xs transition-colors",
        isDisplay && "border-slate-300 dark:border-[#374151] p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-[#273649] pb-3 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-amber-700 dark:text-[#ffd165]">
            {match.arenaName}
          </span>
          <span className="text-slate-300 dark:text-[#475569]">•</span>
          <span className="font-semibold text-slate-800 dark:text-white">
            {match.matchNumber}
          </span>
          <span className="text-slate-300 dark:text-[#475569]">•</span>
          <span className="text-slate-500 dark:text-[#94A3B8]">
            {match.category} — {match.stage}
          </span>
        </div>
        <Badge
          variant={match.status === "LIVE" ? "live" : match.status === "FINISHED" ? "success" : "default"}
        >
          {match.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 sm:gap-4 items-center">
        {/* Sudut Merah */}
        <div className="md:col-span-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50/40 dark:bg-[#17191F] p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 dark:text-[#FCA5A5] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Sudut Merah
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {match.redAthlete.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#64748B] truncate">
              {match.redAthlete.contingent}
            </p>
          </div>
          <div className="font-mono font-bold text-4xl sm:text-6xl text-white bg-red-600 px-3.5 sm:px-4 py-1.5 rounded-lg tabular-nums shrink-0 shadow-xs">
            {match.redScore}
          </div>
        </div>

        {/* Timer Center */}
        <div className="md:col-span-1 flex flex-col items-center justify-center py-2">
          {showTimer ? (
            <MatchTimer
              seconds={match.timeRemainingSeconds}
              status={match.timerStatus}
              round={match.currentRound}
              totalRounds={match.totalRounds}
              size="sm"
            />
          ) : (
            <div className="font-mono font-bold text-2xl text-slate-400 dark:text-[#475569]">VS</div>
          )}
        </div>

        {/* Sudut Biru */}
        <div className="md:col-span-3 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/40 dark:bg-[#17191F] p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="font-mono font-bold text-4xl sm:text-6xl text-white bg-blue-600 px-3.5 sm:px-4 py-1.5 rounded-lg tabular-nums shrink-0 order-last md:order-first shadow-xs">
            {match.blueScore}
          </div>
          <div className="min-w-0 text-right">
            <div className="flex items-center justify-end gap-1.5 text-[11px] font-bold text-blue-600 dark:text-[#93C5FD] uppercase tracking-wider mb-1">
              Sudut Biru
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {match.blueAthlete.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#64748B] truncate">
              {match.blueAthlete.contingent}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
