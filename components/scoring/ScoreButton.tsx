"use client";

import * as React from "react";
import { Corner, ScoringAction } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ScoreButtonProps {
  corner: Corner;
  action: ScoringAction;
  points: number;
  label: string;
  subLabel?: string;
  onClick: (corner: Corner, action: ScoringAction, points: number) => void;
  disabled?: boolean;
}

export function ScoreButton({
  corner,
  action,
  points,
  label,
  subLabel,
  onClick,
  disabled = false,
}: ScoreButtonProps) {
  const [flashRegistered, setFlashRegistered] = React.useState(false);

  const handleClick = () => {
    if (disabled) return;
    setFlashRegistered(true);
    onClick(corner, action, points);

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(30);
      } catch {}
    }

    setTimeout(() => setFlashRegistered(false), 300);
  };

  const isRed = corner === "RED";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      aria-label={`${label} +${points} poin untuk ${isRed ? "Sudut Merah" : "Sudut Biru"}`}
      className={cn(
        "relative w-full flex items-center justify-between px-4 py-3.5 min-h-[64px] rounded-lg font-semibold transition-all duration-100 select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:pointer-events-none",
        isRed
          ? "bg-[#DC2626] hover:bg-[#B91C1C] text-white focus-visible:ring-[#FCA5A5]"
          : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white focus-visible:ring-[#93C5FD]",
        flashRegistered && "animate-score-flash"
      )}
    >
      {flashRegistered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-black/70 text-white font-bold text-xs px-2.5 py-1 rounded tabular-nums">
            +{points}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-md font-bold text-lg tabular-nums shrink-0",
            isRed
              ? "bg-[#991B1B]/60 text-white"
              : "bg-[#1E40AF]/60 text-white"
          )}
        >
          +{points}
        </div>

        <div className="text-left">
          <div className="text-sm sm:text-base font-bold uppercase tracking-wide">
            {label}
          </div>
          {subLabel && (
            <div className="text-[11px] font-medium opacity-75">
              {subLabel}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
