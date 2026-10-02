import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  progress?: {
    percentage: number;
    label?: string;
  };
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subValue,
  icon,
  badge,
  progress,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] rounded-xl p-5 hover:border-amber-400 dark:hover:border-[#4f4633] transition-all group relative overflow-hidden shadow-xs",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 dark:bg-[#ffd165]/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 pointer-events-none" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2.5 bg-amber-50 dark:bg-[#273649] rounded-lg text-amber-600 dark:text-[#ffd165] border border-amber-200/60 dark:border-[#4f4633]/50">
          {icon}
        </div>
        {badge}
      </div>

      <div className="relative z-10">
        <p className="text-xs text-slate-500 dark:text-[#d3c5ac] mb-1 font-medium">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#d5e3fd] tracking-tight">
            {value}
          </h3>
        </div>

        {progress && (
          <div className="w-full bg-slate-100 dark:bg-[#273649] rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-amber-500 dark:bg-[#ffd165] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
            />
          </div>
        )}

        {subValue && (
          <p className="text-xs text-slate-400 dark:text-[#94a3b8] mt-2 font-normal">{subValue}</p>
        )}

        {trend && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#273649] flex items-center text-xs">
            <span
              className={cn(
                "font-medium mr-1.5",
                trend.positive ? "text-emerald-600 dark:text-[#22c55e]" : "text-amber-600 dark:text-[#ffd165]"
              )}
            >
              {trend.value}
            </span>
            <span className="text-slate-400 dark:text-[#94a3b8]">vs sesi sebelumnya</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Memuat statistik..."
      className={cn(
        "bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] rounded-xl p-5 shadow-xs relative overflow-hidden",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-3 w-28 mb-2" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-2.5 w-32" />
      </div>
    </div>
  );
}
