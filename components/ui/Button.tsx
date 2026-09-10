"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "amber"
    | "red"
    | "blue"
    | "danger"
    | "success"
    | "warning"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg" | "xl" | "touch-64" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] cursor-pointer";

    const variants: Record<string, string> = {
      default:
        "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-[#1F232C] dark:hover:bg-[#272C37] dark:text-white dark:border-[#2A2D36] focus-visible:ring-slate-400",
      primary:
        "bg-amber-500 hover:bg-amber-600 dark:bg-[#eab308] dark:hover:bg-[#f7be1d] text-slate-950 dark:text-[#604700] focus-visible:ring-amber-400 shadow-xs",
      amber:
        "bg-amber-500 hover:bg-amber-600 dark:bg-[#eab308] dark:hover:bg-[#f7be1d] text-slate-950 dark:text-[#604700] focus-visible:ring-amber-400 shadow-xs",
      red: "bg-[#DC2626] hover:bg-[#B91C1C] text-white focus-visible:ring-red-400 shadow-xs",
      blue: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white focus-visible:ring-blue-400 shadow-xs",
      danger: "bg-[#EF4444] hover:bg-[#DC2626] text-white focus-visible:ring-red-400 shadow-xs",
      success: "bg-[#22C55E] hover:bg-[#16A34A] text-white focus-visible:ring-green-400 shadow-xs",
      warning: "bg-[#F59E0B] hover:bg-[#D97706] text-white focus-visible:ring-amber-400 shadow-xs",
      outline:
        "bg-transparent hover:bg-slate-100 dark:hover:bg-[#1F232C] text-slate-700 dark:text-white border border-slate-300 dark:border-[#2A2D36] hover:border-slate-400 dark:hover:border-[#3F4653] focus-visible:ring-slate-400",
      ghost:
        "bg-transparent hover:bg-slate-100 dark:hover:bg-[#17191F] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white focus-visible:ring-slate-400",
    };

    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-xs rounded-md gap-1.5",
      md: "h-10 px-4 text-sm rounded-lg gap-2",
      lg: "h-11 px-6 text-sm rounded-lg gap-2",
      xl: "h-14 px-8 text-base rounded-xl gap-3",
      "touch-64": "min-h-[64px] h-auto p-4 text-base rounded-xl gap-3 text-center",
      icon: "h-10 w-10 p-0 rounded-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
