"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-6 text-slate-900 dark:text-[#d5e3fd] shadow-xl animate-in fade-in zoom-in-95 duration-150",
          maxWidths[maxWidth]
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-[#273649]">
          <div>
            {title && <h2 className="text-lg font-bold text-slate-900 dark:text-[#d5e3fd] leading-6">{title}</h2>}
            {description && <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 leading-5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:bg-[#1c2b3e] dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
