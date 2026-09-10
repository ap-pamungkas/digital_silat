import * as React from "react";
import { Judge } from "@/lib/types";
import { JudgeStatus } from "./JudgeStatus";
import { Battery, Tablet, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface JudgeCardProps {
  judge: Judge;
  className?: string;
}

export function JudgeCard({ judge, className }: JudgeCardProps) {
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
        <JudgeStatus status={judge.status} pingMs={judge.pingMs} showText={false} />
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
