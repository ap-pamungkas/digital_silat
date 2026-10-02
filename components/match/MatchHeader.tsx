import * as React from "react";
import { Match, MatchStatus as StatusType } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Trophy } from "lucide-react";

export function MatchHeader({ match }: { match: Match }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-5 shadow-xs transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-[#ffd165]">
            <Trophy className="w-4 h-4" />
            <span className="truncate">{match.tournamentName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#d5e3fd] mt-1 leading-7">
            {match.arenaName} — {match.matchNumber}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-0.5">
            {match.category} • {match.stage}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Badge
            variant={match.status === "LIVE" ? "live" : match.status === "FINISHED" ? "success" : "default"}
            size="lg"
          >
            {match.status}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function MatchStatus({ status }: { status: StatusType }) {
  const variants: Record<StatusType, { label: string; variant: "default" | "live" | "warning" | "success" | "danger" }> = {
    SCHEDULED: { label: "Terjadwal", variant: "default" },
    READY: { label: "Siap Bertanding", variant: "warning" },
    LIVE: { label: "Sedang Bertanding", variant: "live" },
    PAUSED: { label: "Jeda Pertandingan", variant: "warning" },
    FINISHED: { label: "Pertandingan Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "danger" },
  };

  const current = variants[status] || variants.SCHEDULED;

  return <Badge variant={current.variant}>{current.label}</Badge>;
}
