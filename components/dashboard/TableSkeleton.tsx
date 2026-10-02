import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export interface TableSkeletonProps {
  columns?: number | string[];
  rows?: number;
  className?: string;
}

const WIDTH_CLASSES = ["w-3/4", "w-1/2", "w-2/3", "w-4/5", "w-1/3"];

export function TableSkeleton({
  columns = 5,
  rows = 5,
  className,
}: TableSkeletonProps) {
  const colCount = typeof columns === "number" ? columns : columns.length;
  const colHeaders = Array.isArray(columns) ? columns : null;

  return (
    <div
      role="status"
      aria-label="Memuat data tabel..."
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] shadow-xs transition-colors",
        className
      )}
    >
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-[#273649]/40 border-b border-slate-200 dark:border-[#273649] text-slate-500 dark:text-[#94A3B8]">
          <tr>
            {Array.from({ length: colCount }).map((_, index) => (
              <th
                key={index}
                className="px-4 py-3 font-bold text-xs uppercase tracking-wider"
              >
                {colHeaders ? (
                  colHeaders[index]
                ) : (
                  <Skeleton className="h-3.5 w-20" />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#273649]">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: colCount }).map((_, colIndex) => {
                const width = WIDTH_CLASSES[(rowIndex + colIndex) % WIDTH_CLASSES.length];
                return (
                  <td key={colIndex} className="px-4 py-3.5">
                    <Skeleton className={cn("h-4", width)} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
