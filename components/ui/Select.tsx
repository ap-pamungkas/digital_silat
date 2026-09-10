import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-[#F8FAFC]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg border border-slate-300 dark:border-[#2A2D36] bg-white dark:bg-[#17191F] px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:focus-visible:ring-[#ffd165] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-red-500",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-900 dark:bg-[#17191F] dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
