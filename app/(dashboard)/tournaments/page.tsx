"use client";

import * as React from "react";
import { useTournaments, useToast } from "@/hooks";
import { Tournament } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { Trophy, Plus, Search, Calendar, MapPin } from "lucide-react";

export default function TournamentsPage() {
  const { toast } = useToast();
  const {
    filteredTournaments,
    search,
    setSearch,
    isSubmitting,
    createTournament,
  } = useTournaments();

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newTourName, setNewTourName] = React.useState("");
  const [newTourLocation, setNewTourLocation] = React.useState("");
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
        totalArenas: newTourArenas,
      });

      toast.success(
        "Kejuaraan Berhasil Dibuat",
        `Event "${created.name}" dengan alokasi ${created.totalArenas} gelanggang telah tersimpan.`
      );

      setIsCreateOpen(false);
      setNewTourName("");
      setNewTourLocation("");
    } catch (err) {
      toast.error(
        "Gagal Membuat Kejuaraan",
        "Terjadi kesalahan saat memproses data turnamen ke server."
      );
      console.error("Error creating tournament:", err);
    }
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 leading-7">
            <Trophy className="w-6 h-6 text-amber-600 dark:text-[#ffd165]" />
            Manajemen Kejuaraan / Tournament
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#d3c5ac] mt-1">
            Daftar event turnamen silat, pengaturan jadwal, dan konfigurasi gelanggang
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Buat Kejuaraan Baru
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-[#0d1c2f] p-2.5 rounded-xl border border-slate-200 dark:border-[#273649] shadow-xs">
        <Search className="w-4 h-4 text-slate-400 dark:text-[#64748B] ml-2" />
        <input
          type="text"
          placeholder="Cari kejuaraan berdasarkan nama atau lokasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
        />
      </div>

      <DataTable
        data={filteredTournaments}
        columns={columns}
        keyExtractor={(item) => item.id}
      />

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
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Menyimpan..." : "Simpan Kejuaraan"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
