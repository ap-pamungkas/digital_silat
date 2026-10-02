"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
} from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastOptions {
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
  toast: {
    (options: ToastOptions): string;
    success: (title: string, description?: string, duration?: number) => string;
    error: (title: string, description?: string, duration?: number) => string;
    warning: (title: string, description?: string, duration?: number) => string;
    info: (title: string, description?: string, duration?: number) => string;
  };
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = toast.duration ?? 4000;

    setToasts((prev) => [...prev, { ...toast, id, duration }]);

    if (duration > 0) {
      window.setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toastHelper = React.useMemo(() => {
    const base = (opts: ToastOptions) =>
      addToast({
        type: opts.type || "info",
        title: opts.title,
        description: opts.description,
        duration: opts.duration,
      });

    return Object.assign(base, {
      success: (title: string, description?: string, duration?: number) =>
        addToast({ type: "success", title, description, duration }),
      error: (title: string, description?: string, duration?: number) =>
        addToast({ type: "error", title, description, duration }),
      warning: (title: string, description?: string, duration?: number) =>
        addToast({ type: "warning", title, description, duration }),
      info: (title: string, description?: string, duration?: number) =>
        addToast({ type: "info", title, description, duration }),
    });
  }, [addToast]);

  const toastConfigs: Record<
    ToastType,
    {
      icon: React.ComponentType<{ className?: string }>;
      bg: string;
      border: string;
      iconColor: string;
      badgeBg: string;
      badgeText: string;
    }
  > = {
    success: {
      icon: CheckCircle2,
      bg: "bg-white dark:bg-[#0d1c2f]",
      border: "border-emerald-500/30 dark:border-emerald-500/40 shadow-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-[#4ade80]",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
      badgeText: "SUKSES",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-white dark:bg-[#0d1c2f]",
      border: "border-amber-500/30 dark:border-[#ffd165]/40 shadow-amber-500/10",
      iconColor: "text-amber-600 dark:text-[#ffd165]",
      badgeBg: "bg-amber-50 dark:bg-[#eab308]/20 text-amber-800 dark:text-[#ffd165] border-amber-200 dark:border-[#ffd165]/35",
      badgeText: "PERINGATAN",
    },
    error: {
      icon: AlertCircle,
      bg: "bg-white dark:bg-[#0d1c2f]",
      border: "border-red-500/30 dark:border-red-500/40 shadow-red-500/10",
      iconColor: "text-red-600 dark:text-[#f87171]",
      badgeBg: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40",
      badgeText: "GAGAL",
    },
    info: {
      icon: Info,
      bg: "bg-white dark:bg-[#0d1c2f]",
      border: "border-blue-500/30 dark:border-blue-500/40 shadow-blue-500/10",
      iconColor: "text-blue-600 dark:text-[#60a5fa]",
      badgeBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40",
      badgeText: "INFORMASI",
    },
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast: toastHelper }}>
      {children}
      {/* Toast Floating Notification Container */}
      <aside
        aria-live="polite"
        aria-label="Notifikasi Sistem"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((item) => {
          const cfg = toastConfigs[item.type] || toastConfigs.info;
          const IconComponent = cfg.icon;

          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0",
                cfg.bg,
                cfg.border
              )}
            >
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1c2b3e] shrink-0 mt-0.5">
                <IconComponent className={cn("w-5 h-5", cfg.iconColor)} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border",
                      cfg.badgeBg
                    )}
                  >
                    {cfg.badgeText}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#d5e3fd] truncate">
                    {item.title}
                  </h4>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-600 dark:text-[#d3c5ac] leading-relaxed mt-1">
                    {item.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="text-slate-400 hover:text-slate-700 dark:text-[#94a3b8] dark:hover:text-white transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#1c2b3e] shrink-0 cursor-pointer"
                aria-label="Tutup notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
