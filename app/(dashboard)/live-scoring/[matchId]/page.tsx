"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useScoring, useToast } from "@/hooks";
import { ScoreBoard } from "@/components/scoring/ScoreBoard";
import { ScoreEventList } from "@/components/scoring/ScoreEventList";
import { PenaltyDialog } from "@/components/scoring/PenaltyDialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Corner, PenaltyType } from "@/lib/types";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Flag,
  AlertTriangle,
  Tv,
  Cast,
  Smartphone,
  Shield,
} from "lucide-react";

export default function OperatorLiveScoringPage() {
  const params = useParams();
  const matchId = (params?.matchId as string) || "M-001";
  const { toast } = useToast();

  const {
    matches,
    activeMatch,
    setActiveMatchId,
    submitScore,
    applyPenalty,
    toggleTimer,
    resetTimer,
    nextRound,
    endMatch,
    verifyEvent,
    rejectEvent,
  } = useScoring();

  const [isPenaltyOpen, setIsPenaltyOpen] = React.useState(false);
  const [isEndMatchConfirmOpen, setIsEndMatchConfirmOpen] = React.useState(false);
  const [selectedWinner, setSelectedWinner] = React.useState<"RED" | "BLUE" | "DRAW">("RED");

  React.useEffect(() => {
    if (matchId && matchId !== activeMatch.id) {
      setActiveMatchId(matchId);
    }
  }, [matchId, activeMatch.id, setActiveMatchId]);

  const current = matches.find((m) => m.id === matchId) || activeMatch;

  const handleEndMatch = () => {
    endMatch(
      selectedWinner === "DRAW" ? undefined : selectedWinner,
      selectedWinner === "RED"
        ? `Sudut Merah Menang (${current.redAthlete.name})`
        : `Sudut Biru Menang (${current.blueAthlete.name})`
    );
    toast.success(
      "Partai Telah Diselesaikan",
      `Pemenang: ${selectedWinner === "RED" ? current.redAthlete.name : current.blueAthlete.name} (${selectedWinner === "RED" ? "Sudut Merah" : "Sudut Biru"}).`
    );
    setIsEndMatchConfirmOpen(false);
  };

  const handlePenalty = (corner: Corner, type: PenaltyType, points: number, note?: string) => {
    applyPenalty(corner, type, points, note);
    toast.warning(
      "Hukuman Wasit Diberikan",
      `-${points} Poin untuk Sudut ${corner === "RED" ? "Merah" : "Biru"} (${note || type}).`
    );
  };

  const handleToggleTimer = () => {
    const isRunning = current.timerStatus === "RUNNING";
    toggleTimer();
    toast.info(isRunning ? "Waktu Dijeda (PAUSED)" : "Waktu Berjalan (RUNNING)");
  };

  const handleNextRound = () => {
    const nextR = Math.min(current.totalRounds, current.currentRound + 1);
    nextRound();
    toast.info(`Babak ${nextR} Dimulai`, `Durasi waktu babak ${nextR} disiapkan.`);
  };

  const handleVerifyEvent = (eventId: string) => {
    verifyEvent(eventId);
    toast.success("Poin Juri Terverifikasi", "Event penilaian telah disahkan ke papan skor.");
  };

  const handleRejectEvent = (eventId: string) => {
    rejectEvent(eventId);
    toast.warning("Poin Juri Dibatalkan", "Event penilaian telah dikurangi dari skor pertandingan.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-[#FCA5A5] mb-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-live" />
            Operator Control Panel — {current.arenaName}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#d5e3fd] leading-tight truncate">
            {current.matchNumber}: {current.redAthlete.name} vs {current.blueAthlete.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/display/${current.arenaId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1F232C] dark:hover:bg-[#272C37] text-xs font-bold text-emerald-700 dark:text-[#22C55E] border border-slate-200 dark:border-[#2A2D36] transition-colors"
          >
            <Tv className="w-4 h-4" />
            <span>TV Display</span>
          </Link>
          <Link
            href={`/overlay/${current.arenaId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1F232C] dark:hover:bg-[#272C37] text-xs font-bold text-purple-700 dark:text-[#A855F7] border border-slate-200 dark:border-[#2A2D36] transition-colors"
          >
            <Cast className="w-4 h-4" />
            <span>OBS Overlay</span>
          </Link>
          <Link
            href={`/judge/scoring/${current.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-[#2563EB]/10 dark:hover:bg-[#2563EB]/15 text-xs font-bold text-amber-800 dark:text-[#60A5FA] border border-amber-200 dark:border-[#2563EB]/25 transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mode Juri Mobile</span>
          </Link>
        </div>
      </div>

      <ScoreBoard match={current} size="lg" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-5 space-y-5 shadow-xs transition-colors">
            <h3 className="text-xs font-bold text-slate-700 dark:text-[#94A3B8] flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600 dark:text-[#ffd165]" />
              Kontrol Otoritas Operator Wasit
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant={current.timerStatus === "RUNNING" ? "warning" : "success"}
                onClick={handleToggleTimer}
                className="h-12"
              >
                {current.timerStatus === "RUNNING" ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" /> Jeda Timer
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" /> Mulai Timer
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  resetTimer();
                  toast.info("Timer Direset", `Waktu dikembalikan ke ${current.roundDurationSeconds} detik.`);
                }}
                className="h-12"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Reset Timer
              </Button>

              <Button variant="outline" onClick={handleNextRound} className="h-12">
                <FastForward className="w-4 h-4 mr-2" /> Babak Berikut
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  setSelectedWinner(current.redScore >= current.blueScore ? "RED" : "BLUE");
                  setIsEndMatchConfirmOpen(true);
                }}
                className="h-12"
              >
                <Flag className="w-4 h-4 mr-2" /> Selesaikan Partai
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-[#273649]">
              <div className="p-3.5 rounded-xl bg-red-50/50 dark:bg-[#1F232C] border-l-[3px] border-red-600 border border-red-100 dark:border-transparent space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-red-600 dark:text-[#FCA5A5] tabular-nums">
                  <span>Koreksi Manual Merah</span>
                  <span>Skor: {current.redScore}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="red"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      submitScore("RED", "PUKULAN", 1);
                      toast.info("+1 Poin Pukulan", "Sudut Merah +1");
                    }}
                  >
                    +1
                  </Button>
                  <Button
                    variant="red"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      submitScore("RED", "TENDANGAN", 2);
                      toast.info("+2 Poin Tendangan", "Sudut Merah +2");
                    }}
                  >
                    +2
                  </Button>
                  <Button
                    variant="red"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      submitScore("RED", "JATUHAN", 3);
                      toast.info("+3 Poin Jatuhan", "Sudut Merah +3");
                    }}
                  >
                    +3
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3"
                    onClick={() => handlePenalty("RED", "TEGURAN_1", 1, "Koreksi -1")}
                  >
                    -1
                  </Button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-[#1F232C] border-l-[3px] border-blue-600 border border-blue-100 dark:border-transparent space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-[#93C5FD] tabular-nums">
                  <span>Koreksi Manual Biru</span>
                  <span>Skor: {current.blueScore}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="blue"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      submitScore("BLUE", "PUKULAN", 1);
                      toast.info("+1 Poin Pukulan", "Sudut Biru +1");
                    }}
                  >
                    +1
                  </Button>
                  <Button
                    variant="blue"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      submitScore("BLUE", "TENDANGAN", 2);
                      toast.info("+2 Poin Tendangan", "Sudut Biru +2");
                    }}
                  >
                    +2
                  </Button>
                  <Button
                    variant="blue"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      submitScore("BLUE", "JATUHAN", 3);
                      toast.info("+3 Poin Jatuhan", "Sudut Biru +3");
                    }}
                  >
                    +3
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3"
                    onClick={() => handlePenalty("BLUE", "TEGURAN_1", 1, "Koreksi -1")}
                  >
                    -1
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <Button
                variant="warning"
                size="lg"
                onClick={() => setIsPenaltyOpen(true)}
                className="w-full"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Input Hukuman / Penalti Wasit (Teguran / Peringatan / Diskualifikasi)
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-5 flex flex-col justify-between shadow-xs transition-colors">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273649] pb-3 mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-live" />
                Log Masukan Poin Juri
              </h3>
              <Badge variant="outline" size="sm">
                <span className="tabular-nums">{current.events.length} Poin</span>
              </Badge>
            </div>

            <ScoreEventList
              events={current.events}
              isOperator={true}
              onVerify={handleVerifyEvent}
              onReject={handleRejectEvent}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-[#273649] mt-4 text-[11px] text-slate-400 dark:text-[#64748B] leading-5">
            Klik tombol silang pada entri skor jika ingin membatalkan poin yang keliru.
          </div>
        </div>
      </div>

      <PenaltyDialog
        isOpen={isPenaltyOpen}
        onClose={() => setIsPenaltyOpen(false)}
        onConfirmPenalty={handlePenalty}
        redAthleteName={current.redAthlete.name}
        blueAthleteName={current.blueAthlete.name}
      />

      <Dialog
        isOpen={isEndMatchConfirmOpen}
        onClose={() => setIsEndMatchConfirmOpen(false)}
        title="Konfirmasi Selesaikan Partai"
        description="Pilih pemenang dan konfirmasi hasil akhir pertandingan untuk diterbitkan ke rekap turnamen."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedWinner("RED")}
              className={`p-3.5 rounded-xl border-2 font-medium text-left transition-all cursor-pointer ${
                selectedWinner === "RED"
                  ? "bg-red-600 text-white border-red-600 shadow-xs"
                  : "bg-slate-50 dark:bg-[#17191F] text-slate-700 dark:text-[#94A3B8] border-slate-200 dark:border-[#2A2D36] hover:border-red-400"
              }`}
            >
              <div className="text-xs opacity-80 tabular-nums">Pemenang Sudut Merah</div>
              <div className="text-sm font-bold mt-1 truncate leading-5">
                {current.redAthlete.name} ({current.redScore} Pts)
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedWinner("BLUE")}
              className={`p-3.5 rounded-xl border-2 font-medium text-left transition-all cursor-pointer ${
                selectedWinner === "BLUE"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-slate-50 dark:bg-[#17191F] text-slate-700 dark:text-[#94A3B8] border-slate-200 dark:border-[#2A2D36] hover:border-blue-400"
              }`}
            >
              <div className="text-xs opacity-80 tabular-nums">Pemenang Sudut Biru</div>
              <div className="text-sm font-bold mt-1 truncate leading-5">
                {current.blueAthlete.name} ({current.blueScore} Pts)
              </div>
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsEndMatchConfirmOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button variant="danger" onClick={handleEndMatch} className="flex-1">
              Selesaikan & Kunci Skor
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
