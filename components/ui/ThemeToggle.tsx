"use client";

import * as React from "react";
import { useTheme, Theme } from "@/components/ui/ThemeProvider";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon-button" | "segmented" | "dropdown";
}

export function ThemeToggle({ className, variant = "icon-button" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const options: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: "light", label: "Terang (Light)", icon: Sun },
    { value: "dark", label: "Gelap (Dark)", icon: Moon },
    { value: "system", label: "Sistem (Device)", icon: Laptop },
  ];

  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-[#122033] border border-slate-300/80 dark:border-[#273649] gap-1",
          className
        )}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                isSelected
                  ? "bg-white text-slate-900 dark:bg-[#273649] dark:text-[#ffd165] shadow-xs border border-slate-200 dark:border-[#4f4633]"
                  : "text-slate-600 hover:text-slate-900 dark:text-[#d3c5ac] dark:hover:text-white"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-[#eab308] dark:text-[#ffd165]" : "opacity-70")} />
              <span>{opt.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        title={`Tema saat ini: ${theme} (${resolvedTheme})`}
        aria-label="Ganti Tema"
        className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-[#d3c5ac] dark:hover:text-[#ffd165] dark:hover:bg-[#1c2b3e] transition-colors flex items-center justify-center border border-transparent hover:border-slate-300 dark:hover:border-[#273649]"
      >
        {resolvedTheme === "light" ? (
          <Sun className="w-4 h-4 text-amber-600" />
        ) : (
          <Moon className="w-4 h-4 text-[#ffd165]" />
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94a3b8] border-b border-slate-100 dark:border-[#273649]">
            Pilih Tema
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left",
                  isSelected
                    ? "text-[#b45309] bg-amber-50 dark:text-[#ffd165] dark:bg-[#273649]/60 font-semibold"
                    : "text-slate-700 hover:bg-slate-100 dark:text-[#d5e3fd] dark:hover:bg-[#1c2b3e]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("w-4 h-4", isSelected ? "text-[#eab308] dark:text-[#ffd165]" : "text-slate-400 dark:text-[#94a3b8]")} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#eab308] dark:text-[#ffd165]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
