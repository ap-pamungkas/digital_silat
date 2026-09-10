import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-[#F8FAFC]">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-slate-300 dark:border-[#2A2D36] bg-white dark:bg-[#17191F] px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:focus-visible:ring-[#ffd165] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-500 dark:text-[#64748B]">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
