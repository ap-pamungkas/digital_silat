"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useScoring, useToast } from "@/hooks";
import { ScoreButton } from "@/components/scoring/ScoreButton";
import { MatchTimer } from "@/components/scoring/MatchTimer";
import { PenaltyDialog } from "@/components/scoring/PenaltyDialog";
import { ScoreEventList } from "@/components/scoring/ScoreEventList";
import { JudgeStatus } from "@/components/judge/JudgeStatus";
import { Button } from "@/components/ui/Button";
import { Corner, ScoringAction, PenaltyType } from "@/lib/types";
import {
  AlertTriangle,
  History,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";

export default function JudgeScoringPage() {
  const params = useParams();
  const matchId = (params?.matchId as string) || "M-001";
  const { toast } = useToast();

  const {
    matches,
    activeMatch,
    setActiveMatchId,
    currentJudgeNumber,
    submitScore,
    applyPenalty,
  } = useScoring();

  const [isPenaltyOpen, setIsPenaltyOpen] = React.useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = React.useState(false);

  React.useEffect(() => {
    if (matchId && matchId !== activeMatch.id) {
      setActiveMatchId(matchId);
    }
  }, [matchId, activeMatch.id, setActiveMatchId]);

  const match = matches.find((m) => m.id === matchId) || activeMatch;

  const handleJudgeScore = (corner: Corner, action: ScoringAction, points: number) => {
    submitScore(corner, action, points);
    toast.info(
      `+${points} ${action}`,
      `Juri ${currentJudgeNumber} input ${corner === "RED" ? "Sudut Merah" : "Sudut Biru"}.`,
      2000
    );
  };

  const handleJudgePenalty = (corner: Corner, type: PenaltyType, points: number, note?: string) => {
    applyPenalty(corner, type, points, note);
    toast.warning(
      "Hukuman Tercatat",
      `-${points} Poin pada Sudut ${corner === "RED" ? "Merah" : "Biru"} (${note || type}).`
    );
  };

  return (
    <div className="space-y-3 pb-8 select-none">
      <header className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] shadow-xs transition-colors">
        <div className="flex items-center gap-2">
          <Link
            href="/judge"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1F232C] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Keluar ke Menu Juri"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {match.arenaName}
              </span>
              <span className="font-mono text-[10px] text-amber-800 dark:text-[#93C5FD] font-bold bg-amber-50 dark:bg-[#2563EB]/15 px-2 py-0.5 rounded-md border border-amber-200 dark:border-[#2563EB]/30">
                {match.matchNumber}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-[#64748B] truncate max-w-[140px] sm:max-w-xs font-medium">
              {match.category}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="font-mono text-xs font-bold bg-amber-500 dark:bg-[#eab308] text-slate-950 dark:text-[#604700] px-2.5 py-1 rounded-md shadow-xs">
            Juri {currentJudgeNumber}
          </div>
          <JudgeStatus status="ONLINE" pingMs={18} showText={false} />
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-3 shadow-xs transition-colors">
        <MatchTimer
          seconds={match.timeRemainingSeconds}
          status={match.timerStatus}
          round={match.currentRound}
          totalRounds={match.totalRounds}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Panel Sudut Merah */}
        <section
          aria-label="Sudut Merah"
          className="rounded-xl border-2 border-red-500/40 bg-white dark:bg-[#0d1c2f] overflow-hidden flex flex-col justify-between shadow-xs transition-colors"
        >
          <div className="bg-red-600 p-3.5 text-white flex items-center justify-between shadow-xs">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/85 uppercase tracking-wider mb-0.5">
                <span className="w-2 h-2 rounded-full bg-white" />
                Sudut Merah
              </div>
              <h2 className="text-base sm:text-lg font-bold truncate">
                {match.redAthlete.name}
              </h2>
              <p className="text-xs text-white/80 truncate">
                {match.redAthlete.contingent}
              </p>
            </div>

            <div className="font-mono font-bold text-4xl sm:text-5xl bg-black/25 text-white px-3.5 py-1 rounded-lg border border-white/20 shrink-0 tabular-nums">
              {match.redScore}
            </div>
          </div>

          <div className="p-3 sm:p-4 space-y-2.5 bg-slate-50/50 dark:bg-[#0d1c2f]">
            <ScoreButton
              corner="RED"
              action="PUKULAN"
              points={1}
              label="Pukulan"
              subLabel="Tangan Sah"
              onClick={handleJudgeScore}
            />
            <ScoreButton
              corner="RED"
              action="TENDANGAN"
              points={2}
              label="Tendangan"
              subLabel="Kaki Sah"
              onClick={handleJudgeScore}
            />
            <ScoreButton
              corner="RED"
              action="JATUHAN"
              points={3}
              label="Jatuhan"
              subLabel="Bantingan / Kuncian"
              onClick={handleJudgeScore}
            />
          </div>
        </section>

        {/* Panel Sudut Biru */}
        <section
          aria-label="Sudut Biru"
          className="rounded-xl border-2 border-blue-500/40 bg-white dark:bg-[#0d1c2f] overflow-hidden flex flex-col justify-between shadow-xs transition-colors"
        >
          <div className="bg-blue-600 p-3.5 text-white flex items-center justify-between shadow-xs">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/85 uppercase tracking-wider mb-0.5">
                <span className="w-2 h-2 rounded-full bg-white" />
                Sudut Biru
              </div>
              <h2 className="text-base sm:text-lg font-bold truncate">
                {match.blueAthlete.name}
              </h2>
              <p className="text-xs text-white/80 truncate">
                {match.blueAthlete.contingent}
              </p>
            </div>

            <div className="font-mono font-bold text-4xl sm:text-5xl bg-black/25 text-white px-3.5 py-1 rounded-lg border border-white/20 shrink-0 tabular-nums">
              {match.blueScore}
            </div>
          </div>

          <div className="p-3 sm:p-4 space-y-2.5 bg-slate-50/50 dark:bg-[#0d1c2f]">
            <ScoreButton
              corner="BLUE"
              action="PUKULAN"
              points={1}
              label="Pukulan"
              subLabel="Tangan Sah"
              onClick={handleJudgeScore}
            />
            <ScoreButton
              corner="BLUE"
              action="TENDANGAN"
              points={2}
              label="Tendangan"
              subLabel="Kaki Sah"
              onClick={handleJudgeScore}
            />
            <ScoreButton
              corner="BLUE"
              action="JATUHAN"
              points={3}
              label="Jatuhan"
              subLabel="Bantingan / Kuncian"
              onClick={handleJudgeScore}
            />
          </div>
        </section>
      </div>

      <div className="space-y-2.5 pt-1">
        <Button
          variant="warning"
          size="lg"
          onClick={() => setIsPenaltyOpen(true)}
          className="w-full h-12 font-bold shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          Hukuman Wasit / Penalti
        </Button>

        <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] overflow-hidden shadow-xs transition-colors">
          <button
            type="button"
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full p-3 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-[#1F232C]/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-amber-600 dark:text-[#ffd165]" />
              <span>Riwayat Poin Masuk ({match.events.length})</span>
            </div>
            {isHistoryExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isHistoryExpanded && (
            <div className="p-3 border-t border-slate-100 dark:border-[#273649]">
              <ScoreEventList events={match.events} maxItems={8} />
            </div>
          )}
        </div>
      </div>

      <PenaltyDialog
        isOpen={isPenaltyOpen}
        onClose={() => setIsPenaltyOpen(false)}
        onConfirmPenalty={handleJudgePenalty}
        redAthleteName={match.redAthlete.name}
        blueAthleteName={match.blueAthlete.name}
      />
    </div>
  );
}
