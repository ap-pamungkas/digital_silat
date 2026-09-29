"use client";

import * as React from "react";
import Link from "next/link";
import { useScoring, useDashboard, useToast } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FileText, Printer, Download, CheckCircle2, Calendar, ClipboardList } from "lucide-react";

export default function ReportsPage() {
  const { matches } = useScoring();
  const { tournament } = useDashboard();
  const { toast } = useToast();

  const handleExport = () => {
    toast.success(
      "Dokumen Sedang Diunduh",
      "Format rekap skor resmi (PDF/Excel) telah disiapkan untuk diunduh."
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 leading-7">
            <FileText className="w-6 h-6 text-amber-600 dark:text-[#ffd165]" />
            Laporan & Formulir Pertandingan
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#d3c5ac] mt-1">
            Cetak jadwal pertandingan, formulir penilaian manual wasit juri, dan rekapitulasi hasil
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/reports/jadwal-print">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2 text-amber-600 dark:text-[#ffd165]" />
              Cetak Jadwal Tanding
            </Button>
          </Link>

          <Link href="/reports/form-nilai-print">
            <Button variant="outline" size="sm">
              <ClipboardList className="w-4 h-4 mr-2 text-amber-600 dark:text-[#ffd165]" />
              Cetak Form Nilai Juri
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              toast.info("Menyiapkan Cetak", "Membuka dialog pencetakan lembar rekap...");
              window.print();
            }}
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak Rekap Hasil
          </Button>
        </div>
      </div>

      {/* Cards for Quick Access Documents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-[#273649] text-amber-700 dark:text-[#ffd165] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Cetak Jadwal Partai
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              Format cetak jadwal resmi pertandingan per gelanggang untuk dibagikan ke panitia, wasit, dan kontingen.
            </p>
          </div>
          <Link href="/reports/jadwal-print" className="block">
            <Button variant="outline" size="sm" className="w-full">
              Buka Lembar Cetak Jadwal
            </Button>
          </Link>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#1e293b] text-blue-700 dark:text-[#93C5FD] flex items-center justify-center font-bold">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Cetak Form Nilai Juri (Manual)
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              Formulir penilaian cadangan (*backup score sheet*) untuk 5 wasit juri sesuai standar IPSI 2022.
            </p>
          </div>
          <Link href="/reports/form-nilai-print" className="block">
            <Button variant="outline" size="sm" className="w-full">
              Buka Lembar Form Nilai
            </Button>
          </Link>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#064e3b]/30 text-emerald-700 dark:text-[#86EFAC] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Ekspor Hasil & Berita Acara
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              Unduh salinan digital rekapitulasi poin, pemenang, dan medali kontingen ke format PDF / Excel.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleExport} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Ekspor Data Pertandingan
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-6 space-y-6 shadow-xs transition-colors">
        <div className="border-b border-slate-100 dark:border-[#273649] pb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-6">
              Lembar Rekap Hasil Pertandingan Resmi
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 tabular-nums">
              {tournament.id === "TOUR-DEFAULT" ? "Belum ada turnamen terdaftar" : `${tournament.name} • ${tournament.location}`}
            </p>
          </div>
          <Badge variant="success" size="md">
            Terverifikasi Persilat
          </Badge>
        </div>

        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#1F232C] border border-slate-200 dark:border-[#2A2D36] flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-700 dark:text-[#ffd165] font-bold">{match.arenaName}</span>
                  <span className="text-slate-300 dark:text-[#64748B]">•</span>
                  <span className="text-slate-900 dark:text-white font-bold tabular-nums">{match.matchNumber}</span>
                  <span className="text-slate-300 dark:text-[#64748B]">•</span>
                  <span className="text-slate-600 dark:text-[#94A3B8]">{match.category} ({match.stage})</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold flex-wrap">
                  <span className="text-red-600 dark:text-[#FCA5A5]">
                    {match.redAthlete.name} ({match.redAthlete.contingent}) <span className="tabular-nums">:{match.redScore}</span>
                  </span>
                  <span className="text-slate-400 dark:text-[#64748B] tabular-nums">vs</span>
                  <span className="text-blue-600 dark:text-[#93C5FD]">
                    {match.blueAthlete.name} ({match.blueAthlete.contingent}) <span className="tabular-nums">:{match.blueScore}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {match.status === "FINISHED" ? (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-[#22C55E]/10 dark:text-[#86EFAC] px-2.5 py-1 rounded-md border border-emerald-200 dark:border-[#22C55E]/25">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {match.winner === "RED" ? match.redAthlete.name : match.blueAthlete.name} Menang
                    </span>
                    <div className="text-[11px] text-slate-400 dark:text-[#64748B] mt-0.5 tabular-nums">
                      {match.winReason || "Menang Angka"}
                    </div>
                  </div>
                ) : (
                  <Badge variant={match.status === "LIVE" ? "live" : "default"}>
                    {match.status}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
