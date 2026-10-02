"use client";

import * as React from "react";
import { Judge } from "@/lib/types";
import { useArenas, useJudges, useToast } from "@/hooks";
import { JudgeStatus } from "@/components/judge/JudgeStatus";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { UserCheck, ShieldCheck, Plus, Pencil, Trash2 } from "lucide-react";

export default function JudgesPage() {
  const { arenas } = useArenas();
  const { toast } = useToast();
  const {
    judges,
    arenaJudges,
    isLoading,
    selectedArena,
    setSelectedArena,
    onlineCount,
    totalCount,
    addJudge,
    updateJudge,
    deleteJudge,
  } = useJudges();

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingJudge, setEditingJudge] = React.useState<Judge | null>(null);

  const [judgeName, setJudgeName] = React.useState("");
  const [licenseNumber, setLicenseNumber] = React.useState("");
  const [newJudgeArenaId, setNewJudgeArenaId] = React.useState("");
  const [newJudgeNumber, setNewJudgeNumber] = React.useState("1");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const arenaIdForForm = arenas.some((arena) => arena.id === newJudgeArenaId)
    ? newJudgeArenaId
    : arenas[0]?.id ?? "";
  const availableJudgeNumbers = [1, 2, 3, 4, 5].filter((number) =>
    !judges.some((judge) => judge.arenaId === arenaIdForForm && judge.judgeNumber === number)
  );
  const judgeNumberForForm = availableJudgeNumbers.includes(Number(newJudgeNumber))
    ? Number(newJudgeNumber)
    : availableJudgeNumbers[0] ?? 0;
  const activeArenaId = arenas.some((arena) => arena.id === selectedArena)
    ? selectedArena
    : arenas[0]?.id ?? "";

  const handleCreateJudge = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!arenaIdForForm || !judgeNumberForForm || !judgeName.trim()) return;

    setIsSubmitting(true);
    try {
      await addJudge({
        arenaId: arenaIdForForm,
        judgeNumber: judgeNumberForForm,
        name: judgeName,
        licenseNumber,
      });
      setSelectedArena(arenaIdForForm);
      setJudgeName("");
      setLicenseNumber("");
      setIsCreateOpen(false);
      toast.success("Juri Terdaftar", "Data juri telah disimpan ke database.");
    } catch (error) {
      toast.error("Gagal Mendaftarkan Juri", error instanceof Error ? error.message : "Server tidak dapat menyimpan data juri.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditJudge = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingJudge || !judgeName.trim()) return;

    setIsSubmitting(true);
    try {
      await updateJudge(editingJudge.id, {
        name: judgeName,
        licenseNumber,
      });
      setIsEditOpen(false);
      setEditingJudge(null);
      toast.success("Data Juri Diperbarui", "Perubahan data juri telah disimpan.");
    } catch {
      toast.error("Gagal Memperbarui", "Terjadi kesalahan saat mengupdate data juri.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJudge = async (judge: Judge) => {
    if (confirm(`Apakah Anda yakin ingin menghapus juri "${judge.name}" (Juri ${judge.judgeNumber})?`)) {
      try {
        await deleteJudge(judge.id);
        toast.success("Juri Dihapus", "Data juri telah dihapus dari sistem.");
      } catch {
        toast.error("Gagal Menghapus", "Terjadi kesalahan saat menghapus data juri.");
      }
    }
  };

  const openEdit = (judge: Judge) => {
    setEditingJudge(judge);
    setJudgeName(judge.name);
    setLicenseNumber(judge.licenseNumber || "");
    setIsEditOpen(true);
  };

  const columns: Column<Judge>[] = [
    {
      header: "Juri",
      cell: (judge) => (
        <div className="min-w-32">
          <div className="font-bold text-slate-900 dark:text-white">{judge.name}</div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-[#94A3B8]">Juri {judge.judgeNumber}</div>
        </div>
      ),
    },
    {
      header: "Arena",
      cell: (judge) => arenas.find((arena) => arena.id === judge.arenaId)?.name ?? judge.arenaId,
    },
    {
      header: "Status",
      cell: (judge) => <JudgeStatus status={judge.status} pingMs={judge.pingMs} />,
    },
    {
      header: "Perangkat",
      cell: (judge) => judge.device || "Tablet",
    },
    {
      header: "Baterai",
      className: "text-center",
      cell: (judge) => (
        <Badge variant={(judge.batteryLevel ?? 100) >= 30 ? "success" : "danger"}>
          {judge.batteryLevel ?? "-"}{judge.batteryLevel !== undefined ? "%" : ""}
        </Badge>
      ),
    },
    {
      header: "Terakhir Aktif",
      cell: (judge) => <span className="whitespace-nowrap text-xs">{judge.lastActive}</span>,
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (judge) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Edit Juri ${judge.judgeNumber}`}
            title="Edit juri"
            onClick={() => openEdit(judge)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
            aria-label={`Hapus Juri ${judge.judgeNumber}`}
            title="Hapus juri"
            onClick={() => void handleDeleteJudge(judge)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 leading-7">
            <UserCheck className="w-6 h-6 text-emerald-600 dark:text-[#22C55E]" />
            Monitoring Wasit Juri
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#d3c5ac] mt-1">
            Status juri pertandingan, koneksi, level baterai, dan responsivitas dari database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-[#0d1c2f] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#273649] text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-live" />
            <span className="text-slate-500 dark:text-[#94A3B8]">Juri Online:</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">{onlineCount} / {totalCount}</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} disabled={arenas.length === 0}>
            <Plus className="w-4 h-4 mr-1.5" /> Daftarkan Juri
          </Button>
        </div>
      </div>

      <Tabs
        tabs={arenas.map((arena) => ({
          id: arena.id,
          label: arena.name,
          count: judges.filter((judge) => judge.arenaId === arena.id).length,
        }))}
        activeTab={activeArenaId}
        onChange={setSelectedArena}
      />

      {isLoading ? (
        <DataTable
          data={[]}
          columns={columns}
          keyExtractor={(judge) => judge.id}
          isLoading={true}
        />
      ) : arenas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 dark:border-[#273649] p-8 text-center text-sm text-slate-500 dark:text-[#94A3B8]">
          Belum ada data gelanggang di database.
        </p>
      ) : arenaJudges.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 dark:border-[#273649] p-8 text-center text-sm text-slate-500 dark:text-[#94A3B8]">
          Belum ada juri yang terdaftar untuk gelanggang ini.
        </p>
      ) : (
        <DataTable
          data={arenaJudges}
          columns={columns}
          keyExtractor={(judge) => judge.id}
          emptyMessage="Belum ada juri yang terdaftar untuk gelanggang ini."
        />
      )}

      <div className="p-5 rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] flex items-start gap-4 shadow-xs transition-colors">
        <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-[#ffd165] shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-sm">
          <h4 className="font-bold text-slate-900 dark:text-white leading-5">
            Protokol Penilaian 5 Wasit Juri Persilat
          </h4>
          <p className="text-slate-600 dark:text-[#94A3B8] leading-relaxed text-xs sm:text-sm">
            Setiap penilaian sudut merah atau biru yang ditekan oleh minimal 3 dari 5 juri dalam rentang waktu 1 detik
            akan secara otomatis divalidasi ke dalam skor resmi pertandingan. Perangkat juri beroperasi dengan enkripsi
            lokal dan sinkronisasi latensi rendah.
          </p>
        </div>
      </div>

      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Daftarkan Juri"
      >
        <form onSubmit={handleCreateJudge} className="space-y-4">
          <Select
            label="Gelanggang"
            value={arenaIdForForm}
            onChange={(event) => setNewJudgeArenaId(event.target.value)}
            options={arenas.map((arena) => ({ value: arena.id, label: arena.name }))}
            required
          />
          <Select
            label="Nomor Juri"
            value={String(judgeNumberForForm || "")}
            onChange={(event) => setNewJudgeNumber(event.target.value)}
            options={availableJudgeNumbers.map((number) => ({ value: String(number), label: `Juri ${number}` }))}
            required
            disabled={availableJudgeNumbers.length === 0}
          />
          {availableJudgeNumbers.length === 0 ? (
            <p className="text-xs text-amber-700 dark:text-[#ffd165]">Semua posisi juri di gelanggang ini sudah terdaftar.</p>
          ) : null}
          <Input label="Nama Juri" value={judgeName} onChange={(event) => setJudgeName(event.target.value)} required />
          <Input label="Nomor Lisensi" value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Batal</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting || !judgeNumberForForm}>
              {isSubmitting ? "Menyimpan..." : "Simpan Juri"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Data Juri"
      >
        <form onSubmit={handleEditJudge} className="space-y-4">
          <Input label="Nama Juri" value={judgeName} onChange={(event) => setJudgeName(event.target.value)} required />
          <Input label="Nomor Lisensi" value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Batal</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Update Juri"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
