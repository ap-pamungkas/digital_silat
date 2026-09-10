import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "red" | "blue" | "success" | "warning" | "danger" | "live" | "amber" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Badge({ className, variant = "default", size = "md", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#1F232C] dark:text-[#94A3B8] dark:border-[#2A2D36]",
    red: "bg-red-50 text-red-700 border border-red-200 dark:bg-[#DC2626]/15 dark:text-[#FCA5A5] dark:border-[#DC2626]/30",
    blue: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#2563EB]/15 dark:text-[#93C5FD] dark:border-[#2563EB]/30",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#22C55E]/15 dark:text-[#86EFAC] dark:border-[#22C55E]/30",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-[#F59E0B]/15 dark:text-[#FCD34D] dark:border-[#F59E0B]/30",
    amber: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-[#eab308]/20 dark:text-[#ffd165] dark:border-[#ffd165]/35",
    danger: "bg-red-50 text-red-700 border border-red-200 dark:bg-[#EF4444]/15 dark:text-[#FCA5A5] dark:border-[#EF4444]/30",
    live: "bg-red-600 text-white border border-red-600 shadow-xs",
    outline: "bg-transparent text-slate-600 border border-slate-300 dark:text-[#94A3B8] dark:border-[#2A2D36]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-semibold tabular-nums transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {variant === "live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-live absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
        </span>
      )}
      {children}
    </div>
  );
}
