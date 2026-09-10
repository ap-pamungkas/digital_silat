"use client";

import * as React from "react";
import Link from "next/link";
import { useScoring, useMatches, useAthletes, useToast } from "@/hooks";
import { MatchCard } from "@/components/match/MatchCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { Tabs } from "@/components/ui/Tabs";
import { Swords, Search, Radio, Plus, Printer, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MatchesPage() {
  const { toast } = useToast();
  const { matches, refreshMatches } = useScoring();
  const { athletes } = useAthletes();

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
  } = useMatches(matches, refreshMatches);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [matchNumber, setMatchNumber] = React.useState("");
  const [arenaId, setArenaId] = React.useState("ARENA-01");
  const [categoryName, setCategoryName] = React.useState("TANDING - KELAS A PUTRA");
  const [stage, setStage] = React.useState<"PENYISIHAN" | "PEREMPAT_FINAL" | "SEMI_FINAL" | "FINAL">("PENYISIHAN");
  const [redAthleteId, setRedAthleteId] = React.useState("");
  const [blueAthleteId, setBlueAthleteId] = React.useState("");
  const [scheduledTime, setScheduledTime] = React.useState("10:00");

  // Default selection for athletes if available
  React.useEffect(() => {
    if (athletes.length >= 2) {
      if (!redAthleteId) setRedAthleteId(athletes[0].id);
      if (!blueAthleteId) setBlueAthleteId(athletes[1].id);
    }
  }, [athletes, redAthleteId, blueAthleteId]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!matchNumber.trim()) {
      toast.warning("Lengkapi Data", "Nomor partai wajib diisi (contoh: 025).");
      return;
    }

    if (!redAthleteId || !blueAthleteId) {
      toast.warning("Lengkapi Atlet", "Pilih pesilat untuk sudut merah dan sudut biru.");
      return;
    }

    if (redAthleteId === blueAthleteId) {
      toast.warning("Atlet Sama", "Sudut Merah dan Sudut Biru tidak boleh atlet yang sama.");
      return;
    }

    try {
      await createMatch({
        matchNumber: matchNumber.trim(),
        arenaId,
        categoryName,
        stage,
        redAthleteId,
        blueAthleteId,
      });

      toast.success(
        "Partai Berhasil Dibuat",
        `Partai #${matchNumber} telah ditambahkan ke jadwal ${arenaId}.`
      );

      setIsCreateOpen(false);
      setMatchNumber("");
    } catch (err: any) {
      toast.error(
        "Gagal Membuat Partai",
        err.message || "Terjadi kesalahan saat memproses data ke server."
      );
    }
  };

  const statusTabs = [
    { id: "ALL", label: "Semua Partai", count: counts.all },
    { id: "LIVE", label: "Live Bertanding", count: counts.live },
    { id: "UPCOMING", label: "Antrean", count: counts.upcoming },
    { id: "FINISHED", label: "Selesai", count: counts.finished },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 leading-7">
            <Swords className="w-6 h-6 text-red-600 dark:text-red-500" />
            Jadwal & Manajemen Partai Tanding
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#d3c5ac] mt-1">
            Daftar partai pertandingan, alokasi gelanggang, dan kontrol penilaian live
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/reports/jadwal-print">
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Cetak Jadwal
            </Button>
          </Link>

          <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Partai Baru
          </Button>

          <Link href="/live-scoring/M-001">
            <Button variant="primary">
              <Radio className="w-4 h-4 mr-2 animate-live" />
              Panel Kontrol Wasit
            </Button>
          </Link>
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
          <Tabs
            tabs={statusTabs}
            activeTab={statusFilter}
            onChange={setStatusFilter}
          />

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
            {["ARENA-01", "ARENA-02", "ARENA-03", "ARENA-04"].map((arenaCode, idx) => (
              <button
                key={arenaCode}
                type="button"
                onClick={() => setArenaFilter(arenaCode)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-semibold tabular-nums transition-colors cursor-pointer",
                  arenaFilter === arenaCode
                    ? "bg-white text-slate-900 dark:bg-[#273649] dark:text-[#ffd165] shadow-xs border border-slate-200/60 dark:border-[#4f4633]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-[#94A3B8] dark:hover:bg-[#1c2b3e] dark:hover:text-white"
                )}
              >
                Gel {idx + 1}
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
            Jadwalkan partai tanding baru untuk sudut merah dan sudut biru di gelanggang yang tersedia.
          </p>
          <div className="mt-4">
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Partai Baru
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match, idx) => (
            <MatchCard key={`${match.id}-${idx}`} match={match} />
          ))}
        </div>
      )}

      {/* Modal Tambah Partai Baru */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Partai Tanding Baru"
        description="Jadwalkan pertandingan baru dengan menentukan sudut merah, sudut biru, dan gelanggang."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nomor Partai"
              placeholder="Contoh: 025"
              value={matchNumber}
              onChange={(e) => setMatchNumber(e.target.value)}
              required
            />
            <Select
              label="Gelanggang"
              value={arenaId}
              onChange={(e) => setArenaId(e.target.value)}
              options={[
                { value: "ARENA-01", label: "Gelanggang 1 (ARENA-01)" },
                { value: "ARENA-02", label: "Gelanggang 2 (ARENA-02)" },
                { value: "ARENA-03", label: "Gelanggang 3 (ARENA-03)" },
                { value: "ARENA-04", label: "Gelanggang 4 (ARENA-04)" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Kelas Kategori"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              options={[
                { value: "TANDING - KELAS A PUTRA", label: "Tanding - Kelas A Putra" },
                { value: "TANDING - KELAS B PUTRA", label: "Tanding - Kelas B Putra" },
                { value: "TANDING - KELAS C PUTRA", label: "Tanding - Kelas C Putra" },
                { value: "TANDING - KELAS A PUTRI", label: "Tanding - Kelas A Putri" },
                { value: "TANDING - KELAS B PUTRI", label: "Tanding - Kelas B Putri" },
              ]}
            />
            <Select
              label="Babak Pertandingan"
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              options={[
                { value: "PENYISIHAN", label: "Babak Penyisihan" },
                { value: "PEREMPAT_FINAL", label: "Perempat Final" },
                { value: "SEMI_FINAL", label: "Semi Final" },
                { value: "FINAL", label: "Babak Final" },
              ]}
            />
          </div>

          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-[#273649]">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-red-600 dark:text-red-400 uppercase">
                Pesilat Sudut Merah
              </label>
              <select
                value={redAthleteId}
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
                value={blueAthleteId}
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
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Menyimpan..." : "Jadwalkan Partai"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
