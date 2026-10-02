"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useScoring, useToast } from "@/hooks";
import { ScoreBoard } from "@/components/scoring/ScoreBoard";
import { ScoreEventList } from "@/components/scoring/ScoreEventList";
import { PenaltyDialog } from "@/components/scoring/PenaltyDialog";
import { JudgeSessionManager } from "@/components/judge/JudgeSessionManager";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Corner, PenaltyType } from "@/lib/types";
import { penaltyLabel, penaltyPointsForType } from "@/lib/scoring/penalties";
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
      const router = useRouter();
  const matchId = typeof params?.matchId === "string" ? params.matchId : "";
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
  const [selectedWinner, setSelectedWinner] = React.useState<"RED" | "BLUE">("RED");
  const [isFinishingMatch, setIsFinishingMatch] = React.useState(false);

  React.useEffect(() => {
    if (matchId && matchId !== activeMatch.id) {
      setActiveMatchId(matchId);
    }
  }, [matchId, activeMatch.id, setActiveMatchId]);

  const current = matches.find((match) => match.id === matchId);

  if (!current) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#273649] p-10 text-center text-sm text-slate-500 dark:text-[#94A3B8]">
        Pertandingan tidak ditemukan di database.
      </div>
    );
  }

  const handleEndMatch = async () => {
    setIsFinishingMatch(true);
    try {
      await endMatch(selectedWinner, "MENANG_ANGKA");
      toast.success(
        "Partai Telah Diselesaikan",
        `Pemenang: ${selectedWinner === "RED" ? current.redAthlete.name : current.blueAthlete.name}.`
      );
      setIsEndMatchConfirmOpen(false);
      router.push("/matches");
    } catch (error) {
      toast.error(
        "Partai Gagal Diselesaikan",
        error instanceof Error ? error.message : "Hasil pertandingan belum tersimpan."
      );
    } finally {
      setIsFinishingMatch(false);
    }
  };

  const handlePenalty = async (corner: Corner, type: PenaltyType, note?: string) => {
    try {
      await applyPenalty(corner, type, note);
      toast.warning(
        "Hukuman Wasit Diberikan",
        `-${penaltyPointsForType(type)} Poin untuk Sudut ${
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

  const handleToggleTimer = async () => {
    const isRunning = current.timerStatus === "RUNNING";
    if (!isRunning && (current.status === "FINISHED" || current.timeRemainingSeconds === 0)) {
      toast.warning("Timer Selesai", "Atur babak berikutnya atau reset timer sebelum memulai lagi.");
      return;
    }
    try {
      await toggleTimer();
      toast.info(isRunning ? "Waktu Dijeda (PAUSED)" : "Waktu Berjalan (RUNNING)");
    } catch (error) {
      toast.error("Timer Gagal Diperbarui", error instanceof Error ? error.message : "Server tidak dapat memperbarui timer.");
    }
  };

  const handleNextRound = async () => {
    if (current.currentRound >= current.totalRounds) {
      toast.warning("Babak Terakhir", "Tidak ada babak berikutnya untuk pertandingan ini.");
      return;
    }
    const nextR = Math.min(current.totalRounds, current.currentRound + 1);
    try {
      await nextRound();
      toast.info(`Babak ${nextR} Disiapkan`, `Durasi waktu babak ${nextR} disiapkan.`);
    } catch (error) {
      toast.error("Babak Gagal Diperbarui", error instanceof Error ? error.message : "Server tidak dapat memperbarui babak.");
    }
  };

  const handleResetTimer = async () => {
    try {
      await resetTimer();
      toast.info("Timer Direset", `Waktu dikembalikan ke ${current.roundDurationSeconds} detik.`);
    } catch (error) {
      toast.error("Reset Timer Gagal", error instanceof Error ? error.message : "Server tidak dapat mereset timer.");
    }
  };

  const handleVerifyEvent = async (eventId: string) => {
    try {
      await verifyEvent(eventId);
      toast.success("Poin Juri Terverifikasi", "Event penilaian telah disahkan ke papan skor.");
    } catch (error) {
      toast.error("Poin Belum Disahkan", error instanceof Error ? error.message : "Server gagal mengesahkan poin.");
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    try {
      await rejectEvent(eventId);
      toast.warning("Poin Juri Dibatalkan", "Event penilaian telah ditolak pada server.");
    } catch (error) {
      toast.error("Poin Belum Ditolak", error instanceof Error ? error.message : "Server gagal memperbarui event.");
    }
  };

  const handleOperatorScore = async (corner: Corner, action: "PUKULAN" | "TENDANGAN" | "JATUHAN", points: number) => {
    try {
      await submitScore(corner, action, points);
      toast.info(`+${points} Poin ${action.toLowerCase()}`, `Masukan sudut ${corner === "RED" ? "Merah" : "Biru"} tersinkron.`);
    } catch (error) {
      toast.error("Koreksi Skor Gagal", error instanceof Error ? error.message : "Skor tidak dapat disimpan ke server.");
    }
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

      {/* MEJA PUTUSAN SKOR PETUGAS GELANGGANG (OPERATOR DECISION CENTER) */}
      <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 dark:bg-[#0d1c2f] p-5 shadow-xs transition-colors space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Meja Putusan Skor Petugas Gelanggang
              </h2>
            </div>
          </div>
          <Badge
            variant={
              current.events.filter((e) => e.status === "PENDING").length > 0
                ? "warning"
                : "outline"
            }
          >
            {current.events.filter((e) => e.status === "PENDING").length} Usulan Menunggu Putusan
          </Badge>
        </div>

        {current.events.filter((e) => e.status === "PENDING").length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-[#273649] text-center text-xs text-slate-500 dark:text-slate-400">
            Tidak ada antrean usulan skor juri saat ini. Setiap kali juri menekan tombol skor, usulan akan muncul di meja ini untuk diputuskan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {current.events
              .filter((e) => e.status === "PENDING")
              .map((evt) => {
                const isRed = evt.corner === "RED";
                const athleteName = isRed
                  ? current.redAthlete.name
                  : current.blueAthlete.name;
                const judges = evt.judgesAgreed || [evt.judgeNumber];

                return (
                  <div
                    key={evt.id}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                      isRed
                        ? "bg-red-500/10 border-red-500/50"
                        : "bg-blue-500/10 border-blue-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isRed ? "bg-red-600" : "bg-blue-600"
                          }`}
                        />
                        <span
                          className={`text-xs font-bold uppercase tracking-wide ${
                            isRed
                              ? "text-red-600 dark:text-red-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {isRed ? "Sudut Merah" : "Sudut Biru"}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          • {evt.matchTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {judges.map((j) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-xs shadow-xs"
                          >
                            Juri {j}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {athleteName}
                        </div>
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {evt.action.replace(/_/g, " ")}
                        </div>
                      </div>

                      <div
                        className={`text-3xl font-extrabold font-mono px-3 py-1 rounded-lg ${
                          isRed
                            ? "bg-red-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        +{evt.points}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/40 dark:border-[#273649]">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleVerifyEvent(evt.id)}
                        className="font-bold text-xs h-10"
                      >
                        ✅ Sahkan (+{evt.points} Poin)
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectEvent(evt.id)}
                        className="font-bold text-xs h-10"
                      >
                        ❌ Tolak Skor
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
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
                onClick={() => void handleToggleTimer()}
                disabled={current.status === "FINISHED" || (current.timerStatus !== "RUNNING" && current.timeRemainingSeconds === 0)}
                className="h-12"
              >
                {current.timerStatus === "RUNNING" ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" /> Jeda Timer
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" /> {current.timeRemainingSeconds === 0 ? "Waktu Habis" : current.status === "FINISHED" ? "Partai Selesai" : "Mulai Timer"}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => void handleResetTimer()}
                disabled={current.status === "FINISHED"}
                className="h-12"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Reset Timer
              </Button>

              <Button variant="outline" onClick={() => void handleNextRound()} disabled={current.status === "FINISHED" || current.currentRound >= current.totalRounds} className="h-12">
                <FastForward className="w-4 h-4 mr-2" /> Babak Berikut
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  setSelectedWinner(current.redScore >= current.blueScore ? "RED" : "BLUE");
                  setIsEndMatchConfirmOpen(true);
                }}
                disabled={current.status === "FINISHED"}
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
                    onClick={() => void handleOperatorScore("RED", "PUKULAN", 1)}
                  >
                    +1
                  </Button>
                  <Button
                    variant="red"
                    size="sm"
                    className="flex-1"
                    onClick={() => void handleOperatorScore("RED", "TENDANGAN", 2)}
                  >
                    +2
                  </Button>
                  <Button
                    variant="red"
                    size="sm"
                    className="flex-1"
                    onClick={() => void handleOperatorScore("RED", "JATUHAN", 3)}
                  >
                    +3
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3"
                    onClick={() => void handlePenalty("RED", "TEGURAN_1", "Koreksi -1")}
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
                    onClick={() => void handleOperatorScore("BLUE", "PUKULAN", 1)}
                  >
                    +1
                  </Button>
                  <Button
                    variant="blue"
                    size="sm"
                    className="flex-1"
                    onClick={() => void handleOperatorScore("BLUE", "TENDANGAN", 2)}
                  >
                    +2
                  </Button>
                  <Button
                    variant="blue"
                    size="sm"
                    className="flex-1"
                    onClick={() => void handleOperatorScore("BLUE", "JATUHAN", 3)}
                  >
                    +3
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3"
                    onClick={() => void handlePenalty("BLUE", "TEGURAN_1", "Koreksi -1")}
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

          <JudgeSessionManager matchId={current.id} />
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
        onClose={() => {
          if (!isFinishingMatch) setIsEndMatchConfirmOpen(false);
        }}
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
              disabled={isFinishingMatch}
              className="flex-1"
            >
              Batal
            </Button>
            <Button variant="danger" onClick={() => void handleEndMatch()} isLoading={isFinishingMatch} className="flex-1">
              Selesaikan & Kunci Skor
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
