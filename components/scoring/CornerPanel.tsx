"use client";

import * as React from "react";
import { Athlete, Corner, ScoringAction } from "@/lib/types";
import { ScoreButton } from "./ScoreButton";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface CornerPanelProps {
  corner: Corner;
  athlete: Athlete;
  score: number;
  penaltiesCount?: number;
  onScoreAction: (corner: Corner, action: ScoringAction, points: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function CornerPanel({
  corner,
  athlete,
  score,
  penaltiesCount = 0,
  onScoreAction,
  disabled = false,
  compact = false,
}: CornerPanelProps) {
  const isRed = corner === "RED";

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border-2 transition-all overflow-hidden",
        isRed
          ? "bg-[#17191F] border-[#DC2626]/50"
          : "bg-[#17191F] border-[#2563EB]/50"
      )}
    >
      <div
        className={cn(
          "px-4 py-3 flex items-center justify-between text-white border-b",
          isRed
            ? "bg-[#DC2626] border-[#DC2626]/40"
            : "bg-[#2563EB] border-[#2563EB]/40"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="text-xs font-bold tracking-wider uppercase">
            {isRed ? "Sudut Merah" : "Sudut Biru"}
          </span>
        </div>
        {athlete.contingentCode && (
          <span className="text-xs font-bold bg-black/30 px-2 py-0.5 rounded border border-white/15 tabular-nums">
            {athlete.contingentCode}
          </span>
        )}
      </div>

      <div className="p-4 flex items-center justify-between gap-3 border-b border-[#2A2D36]">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white truncate">
            {athlete.name}
          </h3>
          <div className="text-xs text-[#64748B] mt-0.5 truncate">
            {athlete.contingent}
          </div>
          {penaltiesCount > 0 && (
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#FCD34D] font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{penaltiesCount} Hukuman</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "font-mono font-bold text-5xl sm:text-6xl px-3.5 py-1.5 rounded-lg border flex items-center justify-center min-w-[80px] tabular-nums",
            isRed
              ? "bg-[#DC2626]/15 text-white border-[#DC2626]/40"
              : "bg-[#2563EB]/15 text-white border-[#2563EB]/40"
          )}
        >
          {score}
        </div>
      </div>

      <div className={cn("p-3 space-y-2", compact && "p-2 space-y-1.5")}>
        <ScoreButton
          corner={corner}
          action="PUKULAN"
          points={1}
          label="Pukulan"
          subLabel="Serangan Tangan Sah"
          onClick={onScoreAction}
          disabled={disabled}
        />
        <ScoreButton
          corner={corner}
          action="TENDANGAN"
          points={2}
          label="Tendangan"
          subLabel="Serangan Kaki Sah"
          onClick={onScoreAction}
          disabled={disabled}
        />
        <ScoreButton
          corner={corner}
          action="TANGKISAN_PUKULAN"
          points={2}
          label="Counter Pukulan"
          subLabel="Tangkisan/Elakan + Pukulan Masuk"
          onClick={onScoreAction}
          disabled={disabled}
        />
        <ScoreButton
          corner={corner}
          action="TANGKISAN_TENDANGAN"
          points={3}
          label="Counter Tendangan"
          subLabel="Tangkisan/Elakan + Tendangan Masuk"
          onClick={onScoreAction}
          disabled={disabled}
        />
        <ScoreButton
          corner={corner}
          action="JATUHAN"
          points={3}
          label="Jatuhan"
          subLabel="Bantingan / Kuncian Sah"
          onClick={onScoreAction}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
