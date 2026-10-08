"use client";

import * as React from "react";
import { ScoreEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface ScoreEventListProps {
  events: ScoreEvent[];
  minJudgesRequired?: number;
  onVerify?: (id: string) => void;
  onReject?: (id: string) => void;
  isOperator?: boolean;
  maxItems?: number;
  className?: string;
}

export function ScoreEventList({
  events,
  minJudgesRequired = 2,
  onVerify,
  onReject,
  isOperator = false,
  maxItems,
  className,
}: ScoreEventListProps) {
  const displayEvents = maxItems ? events.slice(0, maxItems) : events;

  if (events.length === 0) {
    return (
      <div className={cn("p-6 text-center text-sm text-[#64748B] rounded-xl border border-dashed border-[#2A2D36] bg-[#17191F]", className)}>
        Belum ada riwayat poin yang tercatat untuk babak ini.
      </div>
    );
  }

  return (
    <div className={cn("space-y-2.5 overflow-y-auto max-h-[380px] pr-1", className)}>
      {displayEvents.map((evt) => {
        const isRed = evt.corner === "RED";
        const isVerified = evt.status === "VERIFIED";
        const isRejected = evt.status === "REJECTED";
        const agreedJudgeCount = evt.judgesAgreed?.length ?? 1;
        const hasJudgeQuorum = agreedJudgeCount >= minJudgesRequired;

        return (
          <div
            key={evt.id}
            className={cn(
              "p-3 rounded-xl border text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors",
              isRejected
                ? "bg-[#17191F]/40 border-[#EF4444]/20 opacity-60 line-through"
                : isRed
                ? "bg-white dark:bg-[#17191F] border-l-[4px] border-l-[#DC2626] border-slate-200 dark:border-[#2A2D36]"
                : "bg-white dark:bg-[#17191F] border-l-[4px] border-l-[#2563EB] border-slate-200 dark:border-[#2A2D36]"
            )}
          >
            {/* Informasi Aksi & Poin */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex items-center gap-1 text-slate-400 dark:text-[#64748B] text-xs font-mono tabular-nums shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {evt.matchTime}
                </span>
                <span
                  className={cn(
                    "text-xs font-bold shrink-0",
                    isRed ? "text-red-600 dark:text-[#FCA5A5]" : "text-blue-600 dark:text-[#93C5FD]"
                  )}
                >
                  {isRed ? "Merah" : "Biru"}
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {evt.action.replace(/_/g, " ")}
                </span>
              </div>

              <span
                className={cn(
                  "font-mono font-extrabold px-2.5 py-0.5 rounded-md text-xs tabular-nums shrink-0",
                  isRed
                    ? "bg-red-100 dark:bg-[#DC2626]/20 text-red-700 dark:text-[#FCA5A5] border border-red-200 dark:border-[#DC2626]/30"
                    : "bg-blue-100 dark:bg-[#2563EB]/20 text-blue-700 dark:text-[#93C5FD] border border-blue-200 dark:border-[#2563EB]/30"
                )}
              >
                +{evt.points}
              </span>
            </div>

            {/* Badge Juri & Tombol Aksi */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t border-slate-100 dark:border-[#2A2D36]/60 sm:border-t-0">
              <div className="flex items-center gap-1">
                {evt.judgesAgreed && evt.judgesAgreed.length > 0 ? (
                  evt.judgesAgreed.map((jNum) => (
                    <span
                      key={jNum}
                      className="px-2 py-0.5 rounded bg-amber-100 dark:bg-[#1F232C] text-amber-800 dark:text-amber-400 text-[11px] font-bold border border-amber-300 dark:border-amber-500/30 tabular-nums"
                    >
                      J{jNum}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1F232C] text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-[#2A2D36] tabular-nums">
                    J{evt.judgeNumber}
                  </span>
                )}
              </div>

              {isOperator ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  {evt.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => onVerify?.(evt.id)}
                        disabled={!hasJudgeQuorum}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed min-h-[36px]"
                        title={hasJudgeQuorum ? "Sahkan & Tambahkan Poin ke Skor Atlet" : `Menunggu konsensus ${minJudgesRequired} juri (saat ini ${agreedJudgeCount})`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Sahkan</span>
                      </button>
                      <button
                        onClick={() => onReject?.(evt.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white font-medium text-xs flex items-center gap-1 border border-rose-200 dark:border-rose-500/30 transition-colors cursor-pointer min-h-[36px]"
                        title="Tolak Poin Juri"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                    </>
                  )}
                  {isVerified && (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-xs font-bold border border-emerald-300 dark:border-emerald-500/20">
                        Sah {evt.judgesAgreed && evt.judgesAgreed.length >= 2 ? `(${evt.judgesAgreed.length} Juri)` : ""}
                      </span>
                      <button
                        onClick={() => onReject?.(evt.id)}
                        className="p-1.5 rounded-md bg-rose-50 dark:bg-[#EF4444]/10 text-rose-600 dark:text-[#FCA5A5] hover:bg-rose-100 dark:hover:bg-[#EF4444]/20 border border-rose-200 dark:border-[#EF4444]/25 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Batalkan / Anulir Poin"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {isRejected && (
                    <button
                      onClick={() => onVerify?.(evt.id)}
                      className="p-1.5 rounded-md bg-emerald-50 dark:bg-[#22C55E]/10 text-emerald-600 dark:text-[#86EFAC] hover:bg-emerald-100 dark:hover:bg-[#22C55E]/20 border border-emerald-200 dark:border-[#22C55E]/25 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Pulihkan & Sahkan Poin"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : isVerified ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {evt.judgesAgreed && evt.judgesAgreed.length >= 2
                    ? `Sah (${evt.judgesAgreed.length} Juri)`
                    : "Sah"}
                </span>
              ) : isRejected ? (
                <span className="text-xs text-rose-400 font-medium flex items-center gap-1 shrink-0">
                  <XCircle className="w-3 h-3" />
                  Gugur / Ditolak
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-medium animate-pulse flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  Menunggu Quorum ({agreedJudgeCount}/{minJudgesRequired} Juri)
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
