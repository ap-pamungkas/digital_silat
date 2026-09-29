"use client";

import * as React from "react";
import Link from "next/link";
import { useScoring, useMatches, useAthletes, useArenas, useToast } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { Tabs } from "@/components/ui/Tabs";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { Swords, Search, Radio, Plus, Printer, Pencil, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Match } from "@/lib/types";

type MatchStage = "PENYISIHAN" | "PEREMPAT_FINAL" | "SEMI_FINAL" | "FINAL" | "PEREBUTAN_JUARA_3";

const matchStages: MatchStage[] = [
  "PENYISIHAN",
  "PEREMPAT_FINAL",
  "SEMI_FINAL",
  "FINAL",
  "PEREBUTAN_JUARA_3",
];

function getMatchStage(stage: string): MatchStage {
  const normalized = stage
    .replace(/^BABAK\s+/i, "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase() as MatchStage;

  return matchStages.includes(normalized) ? normalized : "PENYISIHAN";
}

function getScheduledTimeValue(value: string): string {
  return value.match(/\b\d{2}:\d{2}\b/)?.[0] ?? "10:00";
}

function getLocalDateValue(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function formatMatchDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export default function MatchesPage() {
  const { toast } = useToast();
  const { matches, refreshMatches } = useScoring();
  const { athletes } = useAthletes();
  const { arenas } = useArenas();

  const {
    filteredMatches,
    search,
    setSearch,
    arenaFilter,
    setArenaFilter,
    statusFilter,
    setStatusFilter,
    counts,
    isSubmitting,
    createMatch,
    updateMatchSchedule,
    deleteMatch,
  } = useMatches(matches, refreshMatches);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingMatch, setEditingMatch] = React.useState<Match | null>(null);
  const [deletingMatch, setDeletingMatch] = React.useState<Match | null>(null);
  const [matchNumber, setMatchNumber] = React.useState("");
  const [arenaId, setArenaId] = React.useState("");
  const [stage, setStage] = React.useState<MatchStage>("PENYISIHAN");
  const [redAthleteId, setRedAthleteId] = React.useState("");
  const [blueAthleteId, setBlueAthleteId] = React.useState("");
  const [scheduledDate, setScheduledDate] = React.useState(getLocalDateValue);
  const selectedRedAthleteId = athletes.some((athlete) => athlete.id === redAthleteId)
    ? redAthleteId
    : athletes[0]?.id ?? "";
  const selectedBlueAthleteId = athletes.some((athlete) => athlete.id === blueAthleteId)
    ? blueAthleteId
    : athletes[1]?.id ?? "";
  const [scheduledTime, setScheduledTime] = React.useState("10:00");
  const selectedArenaId = arenas.some((arena) => arena.id === arenaId)
    ? arenaId
    : arenas[0]?.id ?? "";
  const liveMatch = matches.find((match) => match.status === "LIVE");

  const openCreateForm = () => {
    setEditingMatch(null);
    setMatchNumber("");
    setArenaId("");
    setStage("PENYISIHAN");
    setRedAthleteId("");
    setBlueAthleteId("");
    setScheduledDate(getLocalDateValue());
    setScheduledTime("10:00");
    setIsCreateOpen(true);
  };

  const openEditForm = (match: Match) => {
    setEditingMatch(match);
    setMatchNumber(match.matchNumber.replace(/^MATCH\s*#?\s*/i, ""));
    setArenaId(match.arenaId);
    setStage(getMatchStage(match.stage));
    setRedAthleteId(match.redAthlete.id);
    setBlueAthleteId(match.blueAthlete.id);
    setScheduledDate(match.scheduledDate ?? getLocalDateValue());
    setScheduledTime(getScheduledTimeValue(match.scheduledTime));
    setIsCreateOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setIsCreateOpen(false);
    setEditingMatch(null);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!matchNumber.trim()) {
      toast.warning("Lengkapi Data", "Nomor partai wajib diisi (contoh: 025).");
      return;
    }
    if (!selectedArenaId) {
      toast.warning("Gelanggang Tidak Tersedia", "Pilih gelanggang yang terdaftar di database.");
      return;
    }
    if (!selectedRedAthleteId || !selectedBlueAthleteId) {
      toast.warning("Lengkapi Atlet", "Pilih pesilat untuk sudut merah dan sudut biru.");
      return;
    }
    if (selectedRedAthleteId === selectedBlueAthleteId) {
      toast.warning("Atlet Sama", "Sudut Merah dan Sudut Biru tidak boleh atlet yang sama.");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.warning("Jadwal Belum Lengkap", "Tentukan tanggal dan jam mulai pertandingan.");
      return;
    }

    try {
      const schedule = {
        matchNumber: matchNumber.trim(),
        arenaId: selectedArenaId,
        stage,
        redAthleteId: selectedRedAthleteId,
        blueAthleteId: selectedBlueAthleteId,
        scheduledDate,
        scheduledTime,
      };

      if (editingMatch) {
        await updateMatchSchedule(editingMatch.id, schedule);
        toast.success("Jadwal diperbarui", `Partai ${schedule.matchNumber} berhasil disimpan.`);
      } else {
        await createMatch(schedule);
        toast.success("Partai dijadwalkan", `Partai ${schedule.matchNumber} mulai pukul ${scheduledTime}.`);
      }

      setIsCreateOpen(false);
      setEditingMatch(null);
      setMatchNumber("");
    } catch (error: unknown) {
      toast.error(
        editingMatch ? "Gagal Memperbarui Jadwal" : "Gagal Membuat Partai",
        error instanceof Error ? error.message : "Terjadi kesalahan saat memproses data ke server."
      );
    }
  };

  const confirmDelete = async () => {
    if (!deletingMatch) return;

    try {
      await deleteMatch(deletingMatch.id);
      toast.success("Jadwal dihapus", `${deletingMatch.matchNumber} berhasil dihapus.`);
      setDeletingMatch(null);
    } catch (error: unknown) {
      toast.error(
        "Gagal Menghapus Jadwal",
        error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus partai."
      );
    }
  };

  const columns: Column<Match>[] = [
    {
      header: "Partai",
      cell: (match) => (
        <div className="min-w-36">
          <div className="font-bold text-slate-900 dark:text-white">{match.matchNumber}</div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-[#94A3B8]">{match.category}</div>
        </div>
      ),
    },
    {
      header: "Arena",
      cell: (match) => <span className="whitespace-nowrap">{match.arenaName}</span>,
    },
    {
      header: "Sudut Merah",
      cell: (match) => (
        <div className="min-w-32">
          <div className="font-semibold text-slate-900 dark:text-white">{match.redAthlete.name}</div>
          <div className="text-xs text-slate-500 dark:text-[#94A3B8]">{match.redAthlete.contingent}</div>
          <div className="mt-1 font-mono font-bold tabular-nums text-red-600 dark:text-red-400">{match.redScore}</div>
        </div>
      ),
    },
    {
      header: "Sudut Biru",
      cell: (match) => (
        <div className="min-w-32">
          <div className="font-semibold text-slate-900 dark:text-white">{match.blueAthlete.name}</div>
          <div className="text-xs text-slate-500 dark:text-[#94A3B8]">{match.blueAthlete.contingent}</div>
          <div className="mt-1 font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400">{match.blueScore}</div>
        </div>
      ),
    },
    {
      header: "Babak",
      cell: (match) => <span className="whitespace-nowrap">{match.stage}</span>,
    },
    {
      header: "Tanggal",
      cell: (match) => <span className="whitespace-nowrap tabular-nums">{formatMatchDate(match.scheduledDate)}</span>,
    },
    {
      header: "Mulai",
      cell: (match) => (
        <div className="whitespace-nowrap tabular-nums">
          <div>{match.scheduledTime}</div>
          {match.status === "LIVE" || match.status === "PAUSED" ? (
            <div className="mt-0.5 text-xs text-slate-500 dark:text-[#94A3B8]">
              Babak {match.currentRound} · {match.timeRemainingSeconds}s
            </div>
          ) : null}
        </div>
      ),
    },
    {
      header: "Pemenang",
      cell: (match) => {
        const winnerName = match.winner === "RED"
          ? match.redAthlete.name
          : match.winner === "BLUE"
            ? match.blueAthlete.name
            : null;
        return winnerName ? (
          <span className="whitespace-nowrap font-semibold text-emerald-700 dark:text-emerald-400">{winnerName}</span>
        ) : <span className="text-slate-400">-</span>;
      },
    },
    {
      header: "Status",
      cell: (match) => (
        <Badge
          variant={
            match.status === "LIVE"
              ? "live"
              : match.status === "FINISHED"
                ? "success"
                : match.status === "PAUSED"
                  ? "warning"
                  : "default"
          }
        >
          {match.status}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (match) => (
        <div className="flex justify-end gap-1">
          {match.status === "SCHEDULED" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Edit ${match.matchNumber}`}
                title="Edit jadwal"
                onClick={() => openEditForm(match)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                aria-label={`Hapus ${match.matchNumber}`}
                title="Hapus jadwal"
                onClick={() => setDeletingMatch(match)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : null}
          <Link
            href={`/live-scoring/${match.id}`}
            title="Kontrol pertandingan"
            aria-label={`Kontrol ${match.matchNumber}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-[#94A3B8] dark:hover:bg-[#1c2b3e]"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  const statusTabs = [
    { id: "ALL", label: "Semua", count: counts.all },
    { id: "LIVE", label: "Live", count: counts.live },
    { id: "UPCOMING", label: "Antrean", count: counts.upcoming },
    { id: "FINISHED", label: "Selesai", count: counts.finished },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 leading-7">
            <Swords className="w-6 h-6 text-red-600 dark:text-red-500" />
            Jadwal Pertandingan
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#d3c5ac] mt-1">
            Atur partai, arena, dan waktu mulai.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/reports/jadwal-print">
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Cetak Jadwal
            </Button>
          </Link>

          <Button variant="outline" onClick={openCreateForm}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Partai Baru
          </Button>

          {liveMatch ? <Link href={`/live-scoring/${liveMatch.id}`}>
            <Button variant="primary">
              <Radio className="w-4 h-4 mr-2 animate-live" />
              Panel Kontrol Wasit
            </Button>
          </Link> : null}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-white dark:bg-[#0d1c2f] p-2.5 rounded-xl border border-slate-200 dark:border-[#273649] shadow-xs">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#64748B] ml-2" />
          <input
            type="text"
            placeholder="Cari partai berdasarkan nomor, nama atlet, kelas tanding..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="w-full min-w-0 overflow-x-auto md:w-auto">
            <Tabs
              tabs={statusTabs}
              activeTab={statusFilter}
              onChange={setStatusFilter}
            />
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#122033] rounded-xl border border-slate-200 dark:border-[#273649] text-xs">
            <button
              type="button"
              onClick={() => setArenaFilter("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer",
                arenaFilter === "ALL"
                  ? "bg-white text-slate-900 dark:bg-[#273649] dark:text-[#ffd165] shadow-xs border border-slate-200/60 dark:border-[#4f4633]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-[#94A3B8] dark:hover:bg-[#1c2b3e] dark:hover:text-white"
              )}
            >
              Semua Arena
            </button>
            {arenas.map((arena) => (
              <button
                key={arena.id}
                type="button"
                onClick={() => setArenaFilter(arena.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-semibold tabular-nums transition-colors cursor-pointer",
                  arenaFilter === arena.id
                    ? "bg-white text-slate-900 dark:bg-[#273649] dark:text-[#ffd165] shadow-xs border border-slate-200/60 dark:border-[#4f4633]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-[#94A3B8] dark:hover:bg-[#1c2b3e] dark:hover:text-white"
                )}
              >
                {arena.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#273649] p-12 text-center bg-white/50 dark:bg-[#0d1c2f]/50">
          <Swords className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Partai Pertandingan</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 max-w-sm mx-auto">
            Tambahkan partai dan atur waktu mulai.
          </p>
          <div className="mt-4">
            <Button variant="primary" size="sm" onClick={openCreateForm}>
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Partai Baru
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          data={filteredMatches}
          columns={columns}
          keyExtractor={(match) => match.id}
          emptyMessage="Tidak ada partai yang cocok dengan filter."
        />
      )}

      {/* Modal Tambah Partai Baru */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={closeForm}
        title={editingMatch ? "Edit Jadwal Partai" : "Buat Partai Tanding Baru"}
        description={editingMatch ? "Ubah detail dan waktu mulai partai." : "Atur partai dan waktu mulai."}
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nomor Partai"
              placeholder="Contoh: 025"
              value={matchNumber}
              onChange={(e) => setMatchNumber(e.target.value)}
              required
            />
            <Input
              label="Tanggal"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
            <Input
              label="Jam Mulai"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
            />
            <Select
              label="Gelanggang"
              value={selectedArenaId}
              onChange={(e) => setArenaId(e.target.value)}
              options={arenas.map((arena) => ({ value: arena.id, label: `${arena.name} (${arena.id})` }))}
              required
              disabled={arenas.length === 0}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Babak Pertandingan"
              value={stage}
              onChange={(e) => setStage(e.target.value as typeof stage)}
              options={[
                { value: "PENYISIHAN", label: "Babak Penyisihan" },
                { value: "PEREMPAT_FINAL", label: "Perempat Final" },
                { value: "SEMI_FINAL", label: "Semi Final" },
                { value: "FINAL", label: "Babak Final" },
                { value: "PEREBUTAN_JUARA_3", label: "Perebutan Juara 3" },
              ]}
            />
          </div>

          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-[#273649]">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-red-600 dark:text-red-400 uppercase">
                Pesilat Sudut Merah
              </label>
              <select
                value={selectedRedAthleteId}
                onChange={(e) => setRedAthleteId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-red-300 dark:border-red-500/40 bg-red-50/50 dark:bg-red-950/20 text-sm text-slate-900 dark:text-white"
                required
              >
                <option value="">Pilih Atlet Sudut Merah...</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.contingent} ({a.weightClass})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                Pesilat Sudut Biru
              </label>
              <select
                value={selectedBlueAthleteId}
                onChange={(e) => setBlueAthleteId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20 text-sm text-slate-900 dark:text-white"
                required
              >
                <option value="">Pilih Atlet Sudut Biru...</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.contingent} ({a.weightClass})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <Button variant="outline" type="button" onClick={closeForm} disabled={isSubmitting} className="flex-1">
              Batal
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting} className="flex-1">
              {editingMatch ? "Simpan Jadwal" : "Jadwalkan"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        isOpen={deletingMatch !== null}
        onClose={() => {
          if (!isSubmitting) setDeletingMatch(null);
        }}
        title="Hapus jadwal partai?"
      >
        <p className="text-sm text-slate-600 dark:text-[#cbd5e1]">
          <span className="font-bold text-slate-900 dark:text-white">{deletingMatch?.matchNumber}</span>
          <br />Hanya partai terjadwal tanpa aktivitas yang dapat dihapus.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={() => setDeletingMatch(null)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={() => void confirmDelete()}
            isLoading={isSubmitting}
            className="flex-1"
          >
            Hapus
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
