"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useScoring, useToast, useJudges } from "@/hooks";
import { JudgeSessionGate } from "@/components/judge/JudgeSessionGate";
import { ScoreButton } from "@/components/scoring/ScoreButton";
import { MatchTimer } from "@/components/scoring/MatchTimer";
import { PenaltyDialog } from "@/components/scoring/PenaltyDialog";
import { ScoreEventList } from "@/components/scoring/ScoreEventList";
import { JudgeStatus } from "@/components/judge/JudgeStatus";
import { Button } from "@/components/ui/Button";
import { Corner, ScoringAction, PenaltyType } from "@/lib/types";
import { penaltyLabel, penaltyPointsForType } from "@/lib/scoring/penalties";
import { REALTIME_STATUS_LABELS } from "@/lib/realtime/events";
import {
  AlertTriangle,
  History,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

function JudgeScoringContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = typeof params?.matchId === "string" ? params.matchId : "";
  const urlJuri = searchParams.get("juri");

  const { toast } = useToast();

  const {
    matches,
    activeMatch,
    setActiveMatchId,
    currentJudgeNumber,
    setCurrentJudgeNumber,
    submitScore,
    applyPenalty,
    lastFeedback,
    realtimeStatus,
    minJudgesRequired = 3,
  } = useScoring();
  const { judges, refreshJudges } = useJudges();

  const [isPenaltyOpen, setIsPenaltyOpen] = React.useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = React.useState(false);
  const [expiredFeedbackTimestamp, setExpiredFeedbackTimestamp] = React.useState<number | null>(null);

  // Sync judge number from URL query if provided (e.g. ?juri=2)
  React.useEffect(() => {
    if (urlJuri) {
      const parsed = parseInt(urlJuri, 10);
      if (parsed >= 1 && parsed <= 5 && parsed !== currentJudgeNumber) {
        setCurrentJudgeNumber(parsed);
      }
    }
  }, [urlJuri, currentJudgeNumber, setCurrentJudgeNumber]);

  React.useEffect(() => {
    if (matchId && matchId !== activeMatch.id) {
      setActiveMatchId(matchId);
    }
  }, [matchId, activeMatch.id, setActiveMatchId]);

  const match = matches.find((item) => item.id === matchId);
  const assignedJudge = judges.find((judge) =>
    judge.judgeNumber === currentJudgeNumber && judge.arenaId === match?.arenaId
  );
  const matchArenaId = match?.arenaId;
  const isJudgeRegistered = Boolean(assignedJudge);

  React.useEffect(() => {
    if (!matchArenaId || isJudgeRegistered) return;
    const interval = setInterval(() => void refreshJudges(), 5000);
    return () => clearInterval(interval);
  }, [matchArenaId, isJudgeRegistered, refreshJudges]);

  const handleJudgeScore = async (
    corner: Corner,
    action: ScoringAction,
    points: number
  ) => {
    if (!assignedJudge) {
      toast.error("Juri Belum Terdaftar", "Minta operator mendaftarkan juri ini di Monitoring Juri sebelum mengirim skor.");
      return;
    }
    try {
      await submitScore(corner, action, points, currentJudgeNumber);
      toast.info(
        `+${points} ${action.replace(/_/g, " ")}`,
        `Masukan Juri ${currentJudgeNumber} tersinkron. Menunggu kuorum juri lain.`,
        1500
      );
    } catch (error) {
      toast.error(
        "Masukan Skor Gagal",
        error instanceof Error ? error.message : "Skor tidak dapat disimpan ke server."
      );
    }
  };

  const handleJudgePenalty = async (
    corner: Corner,
    type: PenaltyType,
    note?: string
  ) => {
    try {
      await applyPenalty(corner, type, note);
      toast.warning(
        "Hukuman Wasit",
        `-${penaltyPointsForType(type)} Poin pada Sudut ${
          corner === "RED" ? "Merah" : "Biru"
        } (${note || penaltyLabel(type)}).`
      );
    } catch (error) {
      toast.error(
        "Hukuman Gagal Disimpan",
        error instanceof Error ? error.message : "Hukuman tidak dapat disimpan ke server."
      );
    }
  };

  React.useEffect(() => {
    if (!lastFeedback) return;
    const timeout = setTimeout(() => setExpiredFeedbackTimestamp(lastFeedback.timestamp), 3500);
    return () => clearTimeout(timeout);
  }, [lastFeedback]);

  const hasRecentFeedback = lastFeedback && expiredFeedbackTimestamp !== lastFeedback.timestamp;

  if (!match) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#273649] p-10 text-center text-sm text-slate-500 dark:text-[#94A3B8]">
        Pertandingan tidak ditemukan di database.
      </div>
    );
  }

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
          {/* Quick Judge Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-[#1F232C] rounded-lg p-0.5 border border-slate-200 dark:border-[#273649]">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCurrentJudgeNumber(num)}
                className={cn(
                  "px-2 py-1 text-xs font-bold rounded-md transition-all",
                  currentJudgeNumber === num
                    ? "bg-amber-500 text-slate-950 dark:bg-[#ffd165] dark:text-[#604700] shadow-xs scale-105"
                    : "text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white"
                )}
                title={`Pindah ke Juri ${num}`}
              >
                J{num}
              </button>
            ))}
          </div>
          <JudgeStatus status={assignedJudge?.status ?? "OFFLINE"} pingMs={assignedJudge?.pingMs} showText={false} />
          <span
            className="hidden sm:inline-flex text-[10px] font-medium text-slate-500 dark:text-[#64748B]"
            title="Status sinkronisasi realtime"
          >
            {REALTIME_STATUS_LABELS[realtimeStatus]}
          </span>
        </div>
      </header>

      {/* Consensus Notification Banner */}
      {hasRecentFeedback && (
        <div
          className={cn(
            "p-3 rounded-xl border flex items-center justify-between transition-all duration-200 animate-in fade-in slide-in-from-top-1",
            lastFeedback.status === "VERIFIED"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              : lastFeedback.status === "PENDING"
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
              : "bg-rose-500/15 border-rose-500/40 text-rose-300"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {lastFeedback.status === "VERIFIED" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : lastFeedback.status === "PENDING" ? (
              <Clock className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider">
                {lastFeedback.status === "VERIFIED"
                  ? `SKOR SAH! (+${lastFeedback.points} ${lastFeedback.corner === "RED" ? "MERAH" : "BIRU"})`
                  : lastFeedback.status === "PENDING"
                  ? `MENUNGGU VALIDASI JURI LAIN (${lastFeedback.agreedJudges.length}/${minJudgesRequired})`
                  : `SKOR GUGUR (TIDAK MENCAPAI ${minJudgesRequired} JURI)`}
              </div>
              <div className="text-[11px] opacity-90 truncate">
                {lastFeedback.action.replace(/_/g, " ")} • Juri Sepakat:{" "}
                {lastFeedback.agreedJudges.map((j) => `J${j}`).join(", ")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Users className="w-4 h-4 opacity-75" />
            <span className="font-mono font-bold text-xs">
              {lastFeedback.agreedJudges.length}/{minJudgesRequired}
            </span>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-3 shadow-xs transition-colors">
        <MatchTimer
          seconds={match.timeRemainingSeconds}
          status={match.timerStatus}
          round={match.currentRound}
          totalRounds={match.totalRounds}
          size="sm"
        />
      </div>

      {!assignedJudge ? (
        <div role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-[#ffd165]">
          Juri {currentJudgeNumber} belum terdaftar pada gelanggang ini. Input skor akan aktif setelah data juri dibuat di Monitoring Juri.
        </div>
      ) : null}

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

          <div className="p-3 sm:p-4 space-y-2 bg-slate-50/50 dark:bg-[#0d1c2f]">
            <ScoreButton
              corner="RED"
              action="PUKULAN"
              points={1}
              label="Pukulan"
              subLabel="Serangan Tangan Sah"
              onClick={handleJudgeScore}
              disabled={!assignedJudge}
            />
            <ScoreButton
              corner="RED"
              action="TENDANGAN"
              points={2}
              label="Tendangan"
              subLabel="Serangan Kaki Sah"
              onClick={handleJudgeScore}
              disabled={!assignedJudge}
            />
            <ScoreButton
              corner="RED"
              action="TANGKISAN_PUKULAN"
              points={2}
              label="Counter Pukulan"
              subLabel="Tangkisan + Pukulan Masuk"
              onClick={handleJudgeScore}
              disabled={!assignedJudge}
            />
            <ScoreButton
              corner="RED"
              action="TANGKISAN_TENDANGAN"
              points={3}
              label="Counter Tendangan"
              subLabel="Tangkisan + Tendangan Masuk"
              onClick={handleJudgeScore}
              disabled={!assignedJudge}
            />
            <ScoreButton
              corner="RED"
              action="JATUHAN"
              points={3}
              label="Jatuhan"
              subLabel="Bantingan / Kuncian Sah"
              onClick={handleJudgeScore}
              disabled={!assignedJudge}
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

          <div className="p-3 sm:p-4 space-y-2 bg-slate-50/50 dark:bg-[#0d1c2f]">
            <ScoreButton
              corner="BLUE"
              action="PUKULAN"
              points={1}
              label="Pukulan"
              subLabel="Serangan Tangan Sah"
              onClick={handleJudgeScore}
              disabled={!assignedJudge}
            />
            <ScoreButton
              corner="BLUE"
              action="TENDANGAN"
              points={2}
              label="Tendangan"
              subLabel="Serangan Kaki Sah"
              onClick={handleJudgeScore}
              disabled={!assignedJudge}
            />
            <ScoreButton
              corner="BLUE"
              action="TANGKISAN_PUKULAN"
              points={2}
              label="Counter Pukulan"
              subLabel="Tangkisan + Pukulan Masuk"
              onClick={handleJudgeScore}
              disabled={!assignedJudge}
            />
            <ScoreButton
              corner="BLUE"
              action="TANGKISAN_TENDANGAN"
              points={3}
              label="Counter Tendangan"
              subLabel="Tangkisan + Tendangan Masuk"
              onClick={handleJudgeScore}
              disabled={!assignedJudge}
            />
            <ScoreButton
              corner="BLUE"
              action="JATUHAN"
              points={3}
              label="Jatuhan"
              subLabel="Bantingan / Kuncian Sah"
              onClick={handleJudgeScore}
              disabled={!assignedJudge}
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
              <span>Riwayat Penilaian ({match.events.length})</span>
            </div>
            {isHistoryExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isHistoryExpanded && (
            <div className="p-3 border-t border-slate-100 dark:border-[#273649]">
              <ScoreEventList events={match.events} maxItems={10} />
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

export default function JudgeScoringPage() {
  const params = useParams();
  const matchId = typeof params?.matchId === "string" ? params.matchId : "";
  return (
    <React.Suspense fallback={<div className="p-6 text-center text-slate-400">Memuat Scoring Pad...</div>}>
      <JudgeSessionGate matchId={matchId || undefined}>
        <JudgeScoringContent />
      </JudgeSessionGate>
    </React.Suspense>
  );
}

