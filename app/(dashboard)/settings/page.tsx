"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/hooks";
import { useTheme, Theme } from "@/components/ui/ThemeProvider";
import { Settings, Shield, Volume2, Save, Sun, Moon, Laptop, Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [roundDuration, setRoundDuration] = React.useState("120");
  const [totalRounds, setTotalRounds] = React.useState("3");
  const [judgeConsensusWindow, setJudgeConsensusWindow] = React.useState("1000");
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      "Pengaturan Berhasil Disimpan",
      "Konfigurasi aturan pertandingan dan preferensi sistem telah diperbarui."
    );
  };

  const themeOptions: { value: Theme; title: string; desc: string; icon: React.ElementType }[] = [
    {
      value: "light",
      title: "Terang (Light)",
      desc: "Kontras bersih untuk ruangan terang / siang hari",
      icon: Sun,
    },
    {
      value: "dark",
      title: "Gelap (Dark)",
      desc: "Nuansa resmi PAGAR Ale-Ale (Ketapang Navy)",
      icon: Moon,
    },
    {
      value: "system",
      title: "Sistem (Device)",
      desc: "Mengikuti preferensi tema sistem perangkat",
      icon: Laptop,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 leading-7">
          <Settings className="w-6 h-6 text-amber-600 dark:text-[#ffd165]" />
          Pengaturan Aturan & Sistem
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#d3c5ac] mt-1">
          Konfigurasi tema tampilan, durasi babak tanding, konsensus juri, penalti, dan audio bel pertandingan.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Theme Settings Section */}
        <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-6 space-y-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 border-b border-slate-200 dark:border-[#273649] pb-3 mb-1">
            <Palette className="w-4 h-4 text-amber-600 dark:text-[#ffd165]" />
            Tema & Tampilan Antarmuka
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "relative flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer group",
                    isSelected
                      ? "border-amber-500 bg-amber-50/70 dark:border-[#ffd165] dark:bg-[#273649]/60 shadow-sm"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-[#273649] dark:bg-[#122033]/60 dark:hover:bg-[#1c2b3e]"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 dark:bg-[#ffd165] text-white dark:text-[#604700] flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors",
                    isSelected
                      ? "bg-amber-500 text-white dark:bg-[#ffd165] dark:text-[#604700]"
                      : "bg-slate-200 text-slate-700 dark:bg-[#273649] dark:text-[#ffd165]"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="font-bold text-sm text-slate-900 dark:text-[#d5e3fd]">
                    {opt.title}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-[#94a3b8] mt-1 leading-relaxed">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Persilat Rules Section */}
        <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-6 space-y-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 border-b border-slate-200 dark:border-[#273649] pb-3 mb-1">
            <Shield className="w-4 h-4 text-amber-600 dark:text-[#ffd165]" />
            Aturan Pertandingan Persilat
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Durasi Per Babak (Detik)"
              type="number"
              value={roundDuration}
              onChange={(e) => setRoundDuration(e.target.value)}
              helperText="Standar IPSI / Persilat: 120 detik (2 Menit)"
              required
            />
            <Input
              label="Jumlah Babak Tanding"
              type="number"
              value={totalRounds}
              onChange={(e) => setTotalRounds(e.target.value)}
              helperText="Standar: 3 Babak"
              required
            />
            <Input
              label="Rentang Konsensus Juri (Milidetik)"
              type="number"
              value={judgeConsensusWindow}
              onChange={(e) => setJudgeConsensusWindow(e.target.value)}
              helperText="Rentang sinkronisasi minimal 3 juri (Default: 1000ms)"
              required
            />
            <Select
              label="Sistem Penilaian Juri"
              value="5_JUDGES"
              onChange={() => {}}
              options={[
                { value: "5_JUDGES", label: "5 Wasit Juri (Resmi IPSI/Persilat)" },
                { value: "3_JUDGES", label: "3 Wasit Juri (Junior/Festival)" },
              ]}
            />
          </div>
        </div>

        {/* Audio & Display Section */}
        <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-6 space-y-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 border-b border-slate-200 dark:border-[#273649] pb-3 mb-1">
            <Volume2 className="w-4 h-4 text-emerald-600 dark:text-[#22c55e]" />
            Audio & Display Pertandingan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-[#122033] border border-slate-200 dark:border-[#273649]">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Bel / Gong Pertandingan</div>
                <div className="text-xs text-slate-500 dark:text-[#64748B] mt-0.5">
                  Bunyikan sinyal saat babak mulai & selesai
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-5 h-5 accent-amber-500 dark:accent-[#eab308] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-[#122033] border border-slate-200 dark:border-[#273649]">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Mode Kontras Ultra TV</div>
                <div className="text-xs text-slate-500 dark:text-[#64748B] mt-0.5">
                  Optimalkan visual scoreboard jarak jauh
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 accent-amber-500 dark:accent-[#eab308] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="lg" type="submit">
            <Save className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
