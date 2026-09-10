"use client";

import * as React from "react";
import { useJudges } from "@/hooks";
import { JudgeCard } from "@/components/judge/JudgeCard";
import { Tabs } from "@/components/ui/Tabs";
import { UserCheck, ShieldCheck } from "lucide-react";

export default function JudgesPage() {
  const {
    judges,
    arenaJudges,
    selectedArena,
    setSelectedArena,
    onlineCount,
    totalCount,
  } = useJudges("ARENA-01");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 leading-7">
            <UserCheck className="w-6 h-6 text-emerald-600 dark:text-[#22C55E]" />
            Monitoring Wasit Juri (5 Juri / Arena)
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#d3c5ac] mt-1">
            Status real-time 5 wasit juri pertandingan, koneksi, level baterai, dan responsivitas
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-[#0d1c2f] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#273649] text-xs shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-live" />
          <span className="text-slate-500 dark:text-[#94A3B8]">Total Juri Aktif:</span>
          <span className="font-bold text-slate-900 dark:text-white tabular-nums">
            {onlineCount} / {totalCount}
          </span>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "ARENA-01", label: "Gelanggang 1 (A)", count: judges.filter((j) => j.arenaId === "ARENA-01").length || 5 },
          { id: "ARENA-02", label: "Gelanggang 2 (B)", count: judges.filter((j) => j.arenaId === "ARENA-02").length || 5 },
          { id: "ARENA-03", label: "Gelanggang 3 (C)", count: judges.filter((j) => j.arenaId === "ARENA-03").length || 5 },
          { id: "ARENA-04", label: "Gelanggang 4 (D)", count: judges.filter((j) => j.arenaId === "ARENA-04").length || 5 },
        ]}
        activeTab={selectedArena}
        onChange={setSelectedArena}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {arenaJudges.map((judge, idx) => (
          <JudgeCard key={`${judge.id}-${judge.arenaId}-${idx}`} judge={judge} />
        ))}
      </div>

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
    </div>
  );
}
