"use client";

import * as React from "react";
import { useTournaments, useToast } from "@/hooks";
import { Tournament } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { Trophy, Plus, Search, Calendar, MapPin, LoaderCircle } from "lucide-react";

export default function TournamentsPage() {
  const { toast } = useToast();
  const {
    filteredTournaments,
    search,
    setSearch,
    isLoading,
    isSubmitting,
    createTournament,
    updateTournament,
    deleteTournament,
  } = useTournaments();

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingTour, setEditingTour] = React.useState<Tournament | null>(null);
  const [deletingTour, setDeletingTour] = React.useState<Tournament | null>(null);

  const [newTourName, setNewTourName] = React.useState("");
  const [newTourLocation, setNewTourLocation] = React.useState("");
  const [newTourStartDate, setNewTourStartDate] = React.useState("");
  const [newTourEndDate, setNewTourEndDate] = React.useState("");
  const [newTourArenas, setNewTourArenas] = React.useState("3");

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourName.trim()) {
      toast.warning("Lengkapi Data", "Nama turnamen / kejuaraan wajib diisi.");
      return;
    }

    try {
      const created = await createTournament({
        name: newTourName.trim(),
        location: newTourLocation.trim() || "GOR Utama",
        startDate: newTourStartDate,
        endDate: newTourEndDate,
        totalArenas: newTourArenas,
      });

      toast.success(
        "Kejuaraan Berhasil Dibuat",
        `Event "${created.name}" dengan alokasi ${created.totalArenas} gelanggang telah tersimpan.`
      );

      setIsCreateOpen(false);
      setNewTourName("");
      setNewTourLocation("");
      setNewTourStartDate("");
      setNewTourEndDate("");
    } catch (err) {
      toast.error(
        "Gagal Membuat Kejuaraan",
        "Terjadi kesalahan saat memproses data turnamen ke server."
      );
      console.error("Error creating tournament:", err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour || !newTourName.trim()) return;

    try {
      await updateTournament(editingTour.id, {
        name: newTourName.trim(),
        location: newTourLocation.trim(),
        startDate: newTourStartDate,
        endDate: newTourEndDate,
      });

      toast.success("Kejuaraan Diperbarui", "Data turnamen berhasil disimpan.");
      setIsEditOpen(false);
      setEditingTour(null);
    } catch {
      toast.error("Gagal Memperbarui", "Terjadi kesalahan saat update data.");
    }
  };

  const confirmDeleteTournament = async () => {
    if (!deletingTour) return;

    try {
      await deleteTournament(deletingTour.id);
      setDeletingTour(null);
      toast.success("Turnamen dihapus", "Data turnamen telah dihapus.");
    } catch {
      toast.error("Gagal menghapus", "Terjadi kesalahan saat menghapus turnamen.");
    }
  };

  const openEdit = (tour: Tournament) => {
    setEditingTour(tour);
    setNewTourName(tour.name);
    setNewTourLocation(tour.location);
    setNewTourStartDate(tour.startDate);
    setNewTourEndDate(tour.endDate);
    setIsEditOpen(true);
  };

  const columns: Column<Tournament>[] = [
    {
      header: "Nama Kejuaraan",
      cell: (item) => (
        <div className="min-w-0">
          <div className="font-bold text-slate-900 dark:text-white text-sm truncate leading-5">{item.name}</div>
          <div className="text-xs text-slate-400 dark:text-[#64748B] mt-0.5 tabular-nums">{item.id}</div>
        </div>
      ),
    },
    {
      header: "Lokasi & Tanggal",
      cell: (item) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-[#94A3B8] text-sm">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-[#ffd165] shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[#64748B] mt-1">
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-[#ffd165] shrink-0" />
            <span className="tabular-nums">{item.startDate} - {item.endDate}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Gelanggang & Partai",
      cell: (item) => (
        <div className="text-xs text-slate-700 dark:text-[#94A3B8] space-y-0.5 font-medium">
          <div className="tabular-nums font-bold text-amber-700 dark:text-[#ffd165]">{item.totalArenas} Gelanggang</div>
          <div className="text-slate-400 dark:text-[#64748B] tabular-nums">{item.totalMatches} Partai • {item.totalAthletes} Atlet</div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge
          variant={
            item.status === "ONGOING"
              ? "live"
              : item.status === "COMPLETED"
              ? "success"
              : "default"
          }
          size="sm"
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeletingTour(item)}>
            Hapus
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
            <Trophy className="w-6 h-6 text-amber-600 dark:text-[#ffd165]" />
            Turnamen
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#d3c5ac] mt-1">
            Atur jadwal dan arena.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Buat Turnamen
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-[#0d1c2f] p-2.5 rounded-xl border border-slate-200 dark:border-[#273649] shadow-xs">
        <Search className="w-4 h-4 text-slate-400 dark:text-[#64748B] ml-2" />
        <input
          type="text"
          placeholder="Cari turnamen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
        />
      </div>

      {isLoading ? (
        <div
          role="status"
          aria-label="Memuat turnamen"
          className="flex min-h-48 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 dark:border-[#273649] dark:bg-[#0d1c2f] dark:text-[#cbd5e1]"
        >
          <LoaderCircle className="h-5 w-5 animate-spin text-amber-600 dark:text-[#ffd165]" />
          Memuat turnamen
        </div>
      ) : (
        <DataTable
          data={filteredTournaments}
          columns={columns}
          keyExtractor={(item) => item.id}
        />
      )}

      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Kejuaraan Silat Baru"
        description="Lengkapi informasi turnamen untuk membuat jadwal dan alokasi gelanggang pertandingan."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Nama Kejuaraan / Event"
            placeholder="Contoh: Kejurda Pencak Silat Kalbar 2026"
            value={newTourName}
            onChange={(e) => setNewTourName(e.target.value)}
            required
          />
          <Input
            label="Lokasi / GOR Pertandingan"
            placeholder="Contoh: GOR Pangsuma, Pontianak"
            value={newTourLocation}
            onChange={(e) => setNewTourLocation(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Mulai"
              type="date"
              value={newTourStartDate}
              onChange={(e) => setNewTourStartDate(e.target.value)}
              required
            />
            <Input
              label="Tanggal Selesai"
              type="date"
              value={newTourEndDate}
              onChange={(e) => setNewTourEndDate(e.target.value)}
              required
            />
          </div>
          <Input
            label="Jumlah Gelanggang yang Digunakan"
            type="number"
            min={1}
            max={8}
            value={newTourArenas}
            onChange={(e) => setNewTourArenas(e.target.value)}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting} className="flex-1">
              Batal
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting} className="flex-1">
              Simpan
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Kejuaraan"
        description="Ubah informasi jadwal atau lokasi kejuaraan."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Nama Kejuaraan / Event"
            value={newTourName}
            onChange={(e) => setNewTourName(e.target.value)}
            required
          />
          <Input
            label="Lokasi / GOR Pertandingan"
            value={newTourLocation}
            onChange={(e) => setNewTourLocation(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Mulai"
              type="date"
              value={newTourStartDate}
              onChange={(e) => setNewTourStartDate(e.target.value)}
              required
            />
            <Input
              label="Tanggal Selesai"
              type="date"
              value={newTourEndDate}
              onChange={(e) => setNewTourEndDate(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)} disabled={isSubmitting} className="flex-1">
              Batal
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting} className="flex-1">
              Perbarui
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        isOpen={deletingTour !== null}
        onClose={() => {
          if (!isSubmitting) setDeletingTour(null);
        }}
        title="Hapus turnamen?"
      >
        <p className="text-sm text-slate-600 dark:text-[#cbd5e1]">
          <span className="font-bold text-slate-900 dark:text-white">{deletingTour?.name}</span>
          <br />Data terkait akan terhapus dan tidak dapat dipulihkan.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={() => setDeletingTour(null)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={() => void confirmDeleteTournament()}
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
