"use client";

import * as React from "react";
import { ScoreEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface ScoreEventListProps {
  events: ScoreEvent[];
  onVerify?: (id: string) => void;
  onReject?: (id: string) => void;
  isOperator?: boolean;
  maxItems?: number;
  className?: string;
}

export function ScoreEventList({
  events,
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
    <div className={cn("space-y-2 overflow-y-auto max-h-[360px] pr-1", className)}>
      {displayEvents.map((evt) => {
        const isRed = evt.corner === "RED";
        const isVerified = evt.status === "VERIFIED";
        const isRejected = evt.status === "REJECTED";

        return (
          <div
            key={evt.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border text-sm",
              isRejected
                ? "bg-[#17191F]/40 border-[#EF4444]/20 opacity-50 line-through"
                : isRed
                ? "bg-[#17191F] border-l-[3px] border-l-[#DC2626] border-t border-t-[#2A2D36] border-r border-r-[#2A2D36] border-b border-b-[#2A2D36]"
                : "bg-[#17191F] border-l-[3px] border-l-[#2563EB] border-t border-t-[#2A2D36] border-r border-r-[#2A2D36] border-b border-b-[#2A2D36]"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center gap-1 text-[#64748B] text-xs font-medium tabular-nums shrink-0">
                <Clock className="w-3 h-3" />
                {evt.matchTime}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {evt.judgesAgreed && evt.judgesAgreed.length > 0 ? (
                  evt.judgesAgreed.map((jNum) => (
                    <span
                      key={jNum}
                      className="px-1.5 py-0.5 rounded bg-[#1F232C] text-amber-300 dark:text-amber-400 text-[11px] font-bold border border-amber-500/30 tabular-nums"
                    >
                      J{jNum}
                    </span>
                  ))
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-[#1F232C] text-white text-xs font-medium border border-[#2A2D36] shrink-0 tabular-nums">
                    J{evt.judgeNumber}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold shrink-0",
                  isRed ? "text-[#FCA5A5]" : "text-[#93C5FD]"
                )}
              >
                {isRed ? "Merah" : "Biru"}
              </span>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium text-white truncate">
                {evt.action.replace(/_/g, " ")}
              </span>
              <span
                className={cn(
                  "font-semibold px-2 py-0.5 rounded text-xs tabular-nums shrink-0",
                  isRed ? "bg-[#DC2626]/15 text-[#FCA5A5] border border-[#DC2626]/25" : "bg-[#2563EB]/15 text-[#93C5FD] border border-[#2563EB]/25"
                )}
              >
                +{evt.points}
              </span>
            </div>

            {isOperator ? (
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {evt.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => onVerify?.(evt.id)}
                      className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      title="Sahkan & Tambahkan Poin ke Skor Atlet"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Sahkan</span>
                    </button>
                    <button
                      onClick={() => onReject?.(evt.id)}
                      className="px-2 py-1 rounded-md bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-medium text-xs flex items-center gap-1 border border-rose-500/30 transition-colors cursor-pointer"
                      title="Tolak Poin Juri"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </>
                )}
                {isVerified && (
                  <button
                    onClick={() => onReject?.(evt.id)}
                    className="p-1.5 rounded-md bg-[#EF4444]/10 text-[#FCA5A5] hover:bg-[#EF4444]/20 border border-[#EF4444]/25 transition-colors cursor-pointer"
                    title="Batalkan / Anulir Poin"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                )}
                {isRejected && (
                  <button
                    onClick={() => onVerify?.(evt.id)}
                    className="p-1.5 rounded-md bg-[#22C55E]/10 text-[#86EFAC] hover:bg-[#22C55E]/20 border border-[#22C55E]/25 transition-colors cursor-pointer"
                    title="Pulihkan & Sahkan Poin"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : isVerified ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 shrink-0 ml-2">
                <CheckCircle className="w-3 h-3" />
                {evt.judgesAgreed && evt.judgesAgreed.length >= 2
                  ? `Sah (${evt.judgesAgreed.length} Juri)`
                  : "Sah"}
              </span>
            ) : isRejected ? (
              <span className="text-xs text-rose-400 font-medium flex items-center gap-1 shrink-0 ml-2">
                <XCircle className="w-3 h-3" />
                Gugur / Ditolak
              </span>
            ) : (
              <span className="text-xs text-amber-400 font-medium animate-pulse flex items-center gap-1 shrink-0 ml-2">
                <Clock className="w-3 h-3" />
                Menunggu Putusan Petugas (0/2)
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
