import * as React from "react";
import Link from "next/link";
import { Match } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatTime, cn } from "@/lib/utils";
import { Clock, ArrowRight, Pencil, Trash2 } from "lucide-react";

interface MatchCardProps {
  match: Match;
  viewMode?: "operator" | "judge" | "compact";
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MatchCard({ match, viewMode = "operator", className, onEdit, onDelete }: MatchCardProps) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-4 shadow-xs transition-colors",
        isLive && "border-l-4 border-l-red-600 dark:border-l-red-500",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-[#273649] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 dark:text-[#ffd165] dark:bg-[#273649] px-2.5 py-0.5 rounded border border-amber-200 dark:border-[#4f4633] tabular-nums">
            {match.arenaName}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] tabular-nums">
            {match.matchNumber}
          </span>
        </div>
        <Badge
          variant={
            isLive ? "live" : isFinished ? "success" : match.status === "PAUSED" ? "warning" : "default"
          }
          size="sm"
        >
          {match.status}
        </Badge>
      </div>

      <div className="text-xs font-semibold text-slate-600 dark:text-[#94A3B8] mb-3">
        {match.category} <span className="text-slate-400 dark:text-[#64748B] font-normal">• {match.stage}</span>
      </div>

      <div className="space-y-2 mb-4">
        {/* Sudut Merah */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-50/50 dark:bg-[#1F232C] border-l-[3px] border-red-600 border border-red-100 dark:border-transparent">
          <div className="min-w-0 pr-2">
            <div className="text-[10px] font-bold text-red-600 dark:text-[#FCA5A5] uppercase tracking-wide">Merah</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate leading-5">
              {match.redAthlete.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#64748B] truncate">
              {match.redAthlete.contingent}
            </div>
          </div>
          <div className="font-mono font-bold text-xl tabular-nums text-white px-3 py-1 rounded-md bg-red-600 shadow-xs">
            {match.redScore}
          </div>
        </div>

        {/* Sudut Biru */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/50 dark:bg-[#1F232C] border-l-[3px] border-blue-600 border border-blue-100 dark:border-transparent">
          <div className="min-w-0 pr-2">
            <div className="text-[10px] font-bold text-blue-600 dark:text-[#93C5FD] uppercase tracking-wide">Biru</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate leading-5">
              {match.blueAthlete.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#64748B] truncate">
              {match.blueAthlete.contingent}
            </div>
          </div>
          <div className="font-mono font-bold text-xl tabular-nums text-white px-3 py-1 rounded-md bg-blue-600 shadow-xs">
            {match.blueScore}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#273649] text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#94A3B8]">
          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-[#64748B]" />
          <span className="tabular-nums font-medium">
            {isLive || match.status === "PAUSED"
              ? `Babak ${match.currentRound} (${formatTime(match.timeRemainingSeconds)})`
              : match.scheduledTime}
          </span>
        </div>

        {viewMode === "judge" ? (
          <Link
            href={`/judge/scoring/${match.id}`}
            className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-[#ffd165] hover:underline"
          >
            Nilai <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
                aria-label={`Edit ${match.matchNumber}`}
                title="Edit jadwal"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                onClick={onDelete}
                aria-label={`Hapus ${match.matchNumber}`}
                title="Hapus jadwal"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Link
              href={`/live-scoring/${match.id}`}
              className="inline-flex items-center gap-1 font-semibold text-xs text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#273649] dark:hover:bg-[#1c2b3e] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#273649] transition-colors"
            >
              Kontrol <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
