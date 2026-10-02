import * as React from "react";
import { Judge } from "@/lib/types";
import { JudgeStatus } from "./JudgeStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { Battery, Tablet, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface JudgeCardProps {
  judge: Judge;
  className?: string;
  onEdit?: (judge: Judge) => void;
  onDelete?: (judge: Judge) => void;
}

export function JudgeCard({ judge, className, onEdit, onDelete }: JudgeCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] text-slate-900 dark:text-[#d5e3fd] shadow-xs transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-[#273649] dark:text-[#ffd165] dark:border-[#4f4633] flex items-center justify-center font-bold tabular-nums text-sm shrink-0">
            J{judge.judgeNumber}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-5">{judge.name}</h4>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Juri {judge.judgeNumber}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <JudgeStatus status={judge.status} pingMs={judge.pingMs} showText={false} />
          {(onEdit || onDelete) && (
            <div className="flex gap-1 ml-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(judge)}
                  className="p-1 text-slate-400 hover:text-blue-500 rounded bg-slate-50 hover:bg-blue-50 dark:bg-transparent dark:hover:bg-[#1a2b42] transition-colors"
                  title="Edit Juri"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(judge)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded bg-slate-50 hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-900/30 transition-colors"
                  title="Hapus Juri"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-[#273649] text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#94A3B8] min-w-0">
          <Tablet className="w-3.5 h-3.5 text-slate-400 dark:text-[#64748B] shrink-0" />
          <span className="truncate">{judge.device || "Tablet"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#94A3B8] justify-end">
          <Battery className={cn(
            "w-3.5 h-3.5 shrink-0",
            (judge.batteryLevel || 90) >= 30 ? "text-emerald-600 dark:text-[#22C55E]" : "text-red-500 dark:text-[#EF4444]"
          )} />
          <span className="tabular-nums font-semibold">{judge.batteryLevel || 90}%</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2 text-slate-400 dark:text-[#64748B]">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Aktivitas terakhir: {judge.lastActive}</span>
        </div>
      </div>
    </div>
  );
}

export function JudgeCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Memuat data juri..."
      className={cn(
        "p-4 rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-[#273649]">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-12 ml-auto" />
        <Skeleton className="h-3 w-36 col-span-2" />
      </div>
    </div>
  );
}
