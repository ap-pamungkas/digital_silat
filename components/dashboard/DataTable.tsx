import * as React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "Tidak ada data ditemukan.",
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 dark:border-[#273649] p-12 text-center text-sm text-slate-400 dark:text-[#94a3b8] bg-white dark:bg-[#0d1c2f]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] shadow-xs transition-colors", className)}>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-[#273649]/40 border-b border-slate-200 dark:border-[#273649] text-slate-500 dark:text-[#94A3B8]">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={cn("px-4 py-3 font-bold text-xs uppercase tracking-wider", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#273649] text-slate-900 dark:text-[#d5e3fd]">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="hover:bg-slate-50/80 dark:hover:bg-[#1c2b3e]/60 transition-colors"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={cn("px-4 py-3", col.className)}>
                  {col.cell
                    ? col.cell(item)
                    : col.accessorKey
                    ? String(item[col.accessorKey] ?? "")
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
