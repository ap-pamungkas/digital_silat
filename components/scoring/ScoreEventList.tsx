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
              <span className="px-1.5 py-0.5 rounded bg-[#1F232C] text-white text-xs font-medium border border-[#2A2D36] shrink-0 tabular-nums">
                J{evt.judgeNumber}
              </span>
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
                {evt.action.replace("_", " ")}
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
                {!isRejected && (
                  <button
                    onClick={() => onReject?.(evt.id)}
                    className="p-1.5 rounded-md bg-[#EF4444]/10 text-[#FCA5A5] hover:bg-[#EF4444]/20 border border-[#EF4444]/25 transition-colors"
                    title="Batalkan / Tolak Poin"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                )}
                {isRejected && (
                  <button
                    onClick={() => onVerify?.(evt.id)}
                    className="p-1.5 rounded-md bg-[#22C55E]/10 text-[#86EFAC] hover:bg-[#22C55E]/20 border border-[#22C55E]/25 transition-colors"
                    title="Pulihkan Poin"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <span className="text-xs text-[#86EFAC] flex items-center gap-1 shrink-0 ml-2">
                <CheckCircle className="w-3 h-3" />
                Sah
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
