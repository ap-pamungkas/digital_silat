"use client";

import * as React from "react";
import { useAthletes, useToast } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { AthleteCard } from "@/components/match/AthleteCard";
import { Users, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AthletesPage() {
  const { toast } = useToast();
  const {
    filteredAthletes,
    search,
    setSearch,
    genderFilter,
    setGenderFilter,
    isSubmitting,
    addAthlete,
  } = useAthletes();

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [contingent, setContingent] = React.useState("");
  const [contingentCode, setContingentCode] = React.useState("");
  const [gender, setGender] = React.useState<"PUTRA" | "PUTRI">("PUTRA");
  const [weightClass, setWeightClass] = React.useState("KELAS A (45-50 kg)");

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contingent.trim()) {
      toast.warning("Lengkapi Data", "Nama atlet dan kontingen wajib diisi sebelum menyimpan.");
      return;
    }

    try {
      await addAthlete({
        name: name.trim(),
        contingent: contingent.trim(),
        contingentCode: contingentCode.trim() || contingent.trim().slice(0, 3).toUpperCase(),
        gender,
        weightClass,
      });

      toast.success(
        "Pendaftaran Berhasil",
        `Pesilat ${name} (${gender === "PUTRA" ? "Putra" : "Putri"}) berhasil didaftarkan ke kontingen ${contingent}.`
      );

      setIsAddOpen(false);
      setName("");
      setContingent("");
      setContingentCode("");
    } catch (err) {
      toast.error(
        "Gagal Menyimpan Atlet",
        "Terjadi gangguan koneksi ke server. Silakan coba beberapa saat lagi."
      );
      console.error("Failed to add athlete:", err);
    }
  };

  const filters = [
    { id: "ALL", label: "Semua" },
    { id: "PUTRA", label: "Putra" },
    { id: "PUTRI", label: "Putri" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 leading-7">
            <Users className="w-6 h-6 text-amber-600 dark:text-[#ffd165]" />
            Manajemen Atlet Silat
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#d3c5ac] mt-1">
            Data atlet kontingen pesilat, kelas tanding, verifikasi penimbangan, dan seeding
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Atlet Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 flex items-center gap-3 bg-white dark:bg-[#0d1c2f] p-2.5 rounded-xl border border-slate-200 dark:border-[#273649] shadow-xs">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#64748B] ml-2" />
          <input
            type="text"
            placeholder="Cari atlet berdasarkan nama atau kontingen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
          />
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#122033] rounded-xl border border-slate-200 dark:border-[#273649] self-start">
          {filters.map((f) => {
            const active = genderFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setGenderFilter(f.id)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg px-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer",
                  active
                    ? "bg-white text-slate-900 dark:bg-[#273649] dark:text-[#ffd165] shadow-xs border border-slate-200/60 dark:border-[#4f4633]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-[#94A3B8] dark:hover:bg-[#1c2b3e] dark:hover:text-white"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredAthletes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#273649] p-12 text-center bg-white/50 dark:bg-[#0d1c2f]/50">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Data Atlet</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 max-w-sm mx-auto">
            Daftarkan pesilat kontingen untuk mulai menyusun bagan pertandingan dan jadwal partai.
          </p>
          <div className="mt-4">
            <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Atlet Baru
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAthletes.map((athlete, idx) => (
            <AthleteCard key={`${athlete.id}-${idx}`} athlete={athlete} />
          ))}
        </div>
      )}

      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Pendaftaran Atlet Baru"
        description="Masukkan profil atlet, kontingen asal, dan kelas tanding."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap Atlet"
            placeholder="Contoh: Bima Sakti"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kontingen / Daerah"
              placeholder="Contoh: Jawa Tengah"
              value={contingent}
              onChange={(e) => setContingent(e.target.value)}
              required
            />
            <Input
              label="Kode Kontingen"
              placeholder="Contoh: JTG"
              value={contingentCode}
              onChange={(e) => setContingentCode(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Kategori Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as "PUTRA" | "PUTRI")}
              options={[
                { value: "PUTRA", label: "Tanding Putra" },
                { value: "PUTRI", label: "Tanding Putri" },
              ]}
            />
            <Select
              label="Kelas Tanding"
              value={weightClass}
              onChange={(e) => setWeightClass(e.target.value)}
              options={[
                { value: "KELAS A (45-50 kg)", label: "Kelas A (45-50 kg)" },
                { value: "KELAS B (50-55 kg)", label: "Kelas B (50-55 kg)" },
                { value: "KELAS C (55-60 kg)", label: "Kelas C (55-60 kg)" },
                { value: "KELAS D (60-65 kg)", label: "Kelas D (60-65 kg)" },
                { value: "KELAS E (65-70 kg)", label: "Kelas E (65-70 kg)" },
                { value: "KELAS F (70-75 kg)", label: "Kelas F (70-75 kg)" },
              ]}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Menyimpan..." : "Simpan Atlet"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
