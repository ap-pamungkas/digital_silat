import * as React from "react";
import { Athlete, Corner } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";

interface AthleteCardProps {
  athlete: Athlete;
  corner?: Corner;
  score?: number;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AthleteCard({ athlete, corner, score, className, onEdit, onDelete }: AthleteCardProps) {
  const isRed = corner === "RED";
  const isBlue = corner === "BLUE";

  const accentBorder = isRed
    ? "border-l-[4px] border-l-red-600"
    : isBlue
    ? "border-l-[4px] border-l-blue-600"
    : "";

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] text-slate-900 dark:text-[#d5e3fd] shadow-xs transition-colors",
        accentBorder,
        className
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={cn(
            "w-11 h-11 rounded-lg flex items-center justify-center font-bold text-lg shrink-0",
            isRed
              ? "bg-red-50 text-red-700 border border-red-200 dark:bg-[#DC2626]/15 dark:text-[#FCA5A5] dark:border-[#DC2626]/25"
              : isBlue
              ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#2563EB]/15 dark:text-[#93C5FD] dark:border-[#2563EB]/25"
              : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#1F232C] dark:text-[#94A3B8] dark:border-[#2A2D36]"
          )}
        >
          {athlete.name.charAt(0)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-5">{athlete.name}</h4>
            {athlete.seed && (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-[#F59E0B]/15 dark:text-[#FCD34D] px-1.5 py-0.5 rounded border border-amber-200 dark:border-[#F59E0B]/25 tabular-nums">
                Seed #{athlete.seed}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-[#94A3B8] font-medium mt-0.5">{athlete.contingent}</p>
          <p className="text-xs text-slate-400 dark:text-[#64748B] mt-0.5 tabular-nums">{athlete.weightClass} • {athlete.gender}</p>
        </div>
      </div>

      {score !== undefined && (
        <div
          className={cn(
            "font-mono font-bold text-2xl tabular-nums px-3.5 py-1 rounded-lg border shrink-0 shadow-xs",
            isRed
              ? "bg-red-600 text-white border-red-600"
              : isBlue
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-slate-100 text-slate-900 border-slate-200 dark:bg-[#1F232C] dark:text-white dark:border-[#2A2D36]"
          )}
        >
          {score}
        </div>
      )}

      {(onEdit || onDelete) && (
        <div className="ml-3 flex shrink-0 items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onEdit}
              aria-label={`Edit ${athlete.name}`}
              title="Edit atlet"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
              onClick={onDelete}
              aria-label={`Hapus ${athlete.name}`}
              title="Hapus atlet"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
