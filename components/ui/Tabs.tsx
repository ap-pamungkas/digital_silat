"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabsProps {
  tabs: { id: string; label: string; count?: number; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#122033] rounded-xl border border-slate-200 dark:border-[#273649] transition-colors",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
              isActive
                ? "bg-white text-slate-900 dark:bg-[#273649] dark:text-[#ffd165] shadow-xs border border-slate-200/80 dark:border-[#4f4633]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-[#94A3B8] dark:hover:bg-[#1c2b3e] dark:hover:text-white"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums font-bold",
                  isActive
                    ? "bg-amber-500 text-slate-950 dark:bg-[#eab308] dark:text-[#604700]"
                    : "bg-slate-200 text-slate-600 dark:bg-[#1c2b3e] dark:text-[#94A3B8]"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
