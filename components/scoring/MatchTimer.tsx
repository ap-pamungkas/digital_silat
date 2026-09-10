import * as React from "react";
import { TimerStatus } from "@/lib/types";
import { formatTime, cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";

interface MatchTimerProps {
  seconds: number;
  status: TimerStatus;
  round: number;
  totalRounds?: number;
  size?: "sm" | "md" | "lg" | "display";
  showControls?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function MatchTimer({
  seconds,
  status,
  round,
  totalRounds = 3,
  size = "md",
  showControls = false,
  onToggle,
  className,
}: MatchTimerProps) {
  const isCritical = seconds <= 10 && seconds > 0 && status === "RUNNING";
  const isFinished = seconds === 0 || status === "FINISHED";
  const isPaused = status === "PAUSED";

  const sizeClasses = {
    sm: "text-2xl sm:text-3xl py-1 px-3",
    md: "text-4xl sm:text-5xl py-2 px-5",
    lg: "text-5xl sm:text-6xl py-3 px-6",
    display: "text-6xl sm:text-8xl py-4 px-8",
  };

  const clockStyle = cn(
    "rounded-lg border transition-colors duration-200 select-none flex items-center justify-center font-mono font-bold tabular-nums tracking-tight",
    sizeClasses[size],
    isFinished
      ? "border-[#DC2626]/40 bg-[#DC2626]/10 text-[#FCA5A5]"
      : isCritical
      ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#FCD34D]"
      : isPaused
      ? "border-[#F59E0B]/30 bg-[#F59E0B]/5 text-[#FCD34D]"
      : "border-[#2A2D36] bg-[#1F232C] text-white"
  );

  return (
    <div className={cn("flex flex-col items-center justify-center text-center", className)}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-mono text-[11px] sm:text-xs font-medium uppercase tracking-wider text-[#64748B] bg-[#1F232C] px-2.5 py-0.5 rounded-md border border-[#2A2D36]">
          Babak {round} / {totalRounds}
        </span>
        {status === "RUNNING" && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#86EFAC]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-live absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22C55E]" />
            </span>
            LIVE
          </span>
        )}
        {status === "PAUSED" && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#FCD34D]">
            <Pause className="w-3 h-3" />
            PAUSED
          </span>
        )}
        {isFinished && (
          <span className="text-[10px] font-medium text-[#FCA5A5]">
            SELESAI
          </span>
        )}
      </div>

      <div className={clockStyle}>
        {formatTime(seconds)}
      </div>

      {showControls && onToggle && (
        <button
          onClick={onToggle}
          type="button"
          className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1F232C] hover:bg-[#272C37] text-xs font-medium text-white border border-[#2A2D36] transition-colors"
        >
          {status === "RUNNING" ? (
            <>
              <Pause className="w-3.5 h-3.5 text-[#FCD34D]" />
              <span>Jeda</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-[#86EFAC]" />
              <span>Mulai</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
