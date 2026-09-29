"use client";

import * as React from "react";
import Link from "next/link";
import { useScoring, useDashboard } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Printer, ArrowLeft, Shield } from "lucide-react";

export default function FormNilaiPrintPage() {
  const { matches } = useScoring();
  const { tournament } = useDashboard();
  const [selectedMatchId, setSelectedMatchId] = React.useState("");
  const [selectedJudgeNo, setSelectedJudgeNo] = React.useState<number>(1);

  const currentMatch = matches.find((m) => m.id === selectedMatchId) || matches[0] || null;
  const rounds = currentMatch ? Array.from({ length: currentMatch.totalRounds }, (_, index) => index + 1) : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070d18] p-4 sm:p-8 text-slate-900 print:bg-white print:p-0 print:text-black">
      {/* Control Toolbar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Laporan
            </Button>
          </Link>
          <div className="text-sm font-semibold text-slate-700 dark:text-[#94A3B8]">
            Formulir Penilaian Tanding Resmi (Manual Backup Sheet)
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={currentMatch?.id ?? ""}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#273649] bg-white dark:bg-[#122033] text-sm text-slate-900 dark:text-white"
          >
            {matches.length === 0 ? <option value="">Tidak ada pertandingan</option> : null}
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.matchNumber} ({m.arenaName} - {m.redAthlete.name} vs {m.blueAthlete.name})
              </option>
            ))}
          </select>

          <select
            value={selectedJudgeNo}
            onChange={(e) => setSelectedJudgeNo(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#273649] bg-white dark:bg-[#122033] text-sm text-slate-900 dark:text-white"
          >
            {[1, 2, 3, 4, 5].map((j) => (
              <option key={j} value={j}>
                Lembar Juri {j}
              </option>
            ))}
          </select>

          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak Formulir (Print / PDF)
          </Button>
        </div>
      </div>

      {/* Printable Score Sheet (A4 format) */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
        {/* Header KOP */}
        <div className="border-b-2 border-black pb-3 mb-4 text-center">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-700 print:text-black">
            LEMBAR PENILAIAN TANDING PENCAK SILAT (IPSI 2022)
          </div>
          <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 print:text-black mt-0.5">
            {tournament.id === "TOUR-DEFAULT" ? "BELUM ADA TURNAMEN" : tournament.name}
          </h1>
          <div className="text-xs font-semibold text-slate-600 print:text-black">
            {tournament.id === "TOUR-DEFAULT" ? "—" : `${tournament.location} • ${tournament.startDate} - ${tournament.endDate}`}
          </div>
        </div>

        {/* Match Details Box */}
        <div className="grid grid-cols-2 gap-4 border border-black p-3 mb-4 text-xs">
          <div>
            <div className="flex gap-2 py-0.5">
              <span className="font-semibold w-24">Gelanggang:</span>
              <span className="font-bold">{currentMatch?.arenaName || "—"}</span>
            </div>
            <div className="flex gap-2 py-0.5">
              <span className="font-semibold w-24">Nomor Partai:</span>
              <span className="font-bold">{currentMatch?.matchNumber || "—"}</span>
            </div>
            <div className="flex gap-2 py-0.5">
              <span className="font-semibold w-24">Babak:</span>
              <span>{currentMatch?.stage || "—"}</span>
            </div>
          </div>
          <div>
            <div className="flex gap-2 py-0.5">
              <span className="font-semibold w-24">Kelas Tanding:</span>
              <span className="font-bold">{currentMatch?.category || "—"}</span>
            </div>
            <div className="flex gap-2 py-0.5">
              <span className="font-semibold w-24">Posisi Penilai:</span>
              <span className="font-bold uppercase">WASIT JURI {selectedJudgeNo}</span>
            </div>
            <div className="flex gap-2 py-0.5">
              <span className="font-semibold w-24">Waktu Ronde:</span>
              <span>{currentMatch ? `${currentMatch.totalRounds} Babak @ ${Math.floor(currentMatch.roundDurationSeconds / 60)} Menit` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Athletes Banner */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-bold text-center">
          <div className="bg-red-100 print:bg-red-50 border border-black p-2 text-red-900 print:text-black">
            <div className="text-[10px] uppercase">SUDUT MERAH</div>
            <div className="text-sm font-black mt-0.5">{currentMatch?.redAthlete.name}</div>
            <div className="text-[11px] font-semibold">{currentMatch?.redAthlete.contingent}</div>
          </div>
          <div className="bg-blue-100 print:bg-blue-50 border border-black p-2 text-blue-900 print:text-black">
            <div className="text-[10px] uppercase">SUDUT BIRU</div>
            <div className="text-sm font-black mt-0.5">{currentMatch?.blueAthlete.name}</div>
            <div className="text-[11px] font-semibold">{currentMatch?.blueAthlete.contingent}</div>
          </div>
        </div>

        {/* Scoring Matrix Table for Rounds I, II, III */}
        <table className="w-full text-xs border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-slate-200 print:bg-slate-100 border-b border-black text-center font-bold">
              <th rowSpan={2} className="border border-black px-2 py-2 w-16">BABAK</th>
              <th colSpan={3} className="border border-black px-2 py-1 bg-red-50 print:bg-transparent">
                SUDUT MERAH
              </th>
              <th colSpan={3} className="border border-black px-2 py-1 bg-blue-50 print:bg-transparent">
                SUDUT BIRU
              </th>
            </tr>
            <tr className="bg-slate-100 border-b border-black text-center text-[10px] font-semibold">
              <th className="border border-black px-2 py-1">Serangan Sah (+1, +2, +3)</th>
              <th className="border border-black px-2 py-1 w-24">Hukuman (-1, -2, -5, -10)</th>
              <th className="border border-black px-2 py-1 w-16 font-bold">Total</th>

              <th className="border border-black px-2 py-1">Serangan Sah (+1, +2, +3)</th>
              <th className="border border-black px-2 py-1 w-24">Hukuman (-1, -2, -5, -10)</th>
              <th className="border border-black px-2 py-1 w-16 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => (
              <tr key={round} className="h-20 border-b border-black">
                <td className="border border-black text-center font-bold bg-slate-50 print:bg-transparent">
                  BABAK {round}
                </td>

                {/* Sudut Merah */}
                <td className="border border-black p-2 align-top text-[11px] font-mono">
                  {/* Empty dots / check lines for manual writing */}
                  <div className="h-full flex flex-wrap gap-1 content-start"></div>
                </td>
                <td className="border border-black p-2 align-top text-[11px] text-center font-mono"></td>
                <td className="border border-black text-center font-mono font-bold text-sm bg-slate-50 print:bg-transparent"></td>

                {/* Sudut Biru */}
                <td className="border border-black p-2 align-top text-[11px] font-mono">
                  <div className="h-full flex flex-wrap gap-1 content-start"></div>
                </td>
                <td className="border border-black p-2 align-top text-[11px] text-center font-mono"></td>
                <td className="border border-black text-center font-mono font-bold text-sm bg-slate-50 print:bg-transparent"></td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="bg-slate-200 print:bg-slate-100 font-bold text-center h-10">
              <td className="border border-black uppercase">TOTAL AKHIR</td>
              <td colSpan={2} className="border border-black text-right pr-3 text-[11px]">
                Total Sudut Merah:
              </td>
              <td className="border border-black font-mono text-base font-bold"></td>
              <td colSpan={2} className="border border-black text-right pr-3 text-[11px]">
                Total Sudut Biru:
              </td>
              <td className="border border-black font-mono text-base font-bold"></td>
            </tr>
          </tbody>
        </table>

        {/* Winner Declaration Box */}
        <div className="border border-black p-3 mb-8 text-xs">
          <div className="font-bold uppercase mb-2">Keputusan Pemenang:</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border border-black inline-block"></span>
              <span>Sudut Merah ( {currentMatch?.redAthlete.name} )</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border border-black inline-block"></span>
              <span>Sudut Biru ( {currentMatch?.blueAthlete.name} )</span>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-3 text-[11px]">
            <span>Alasan:</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 border border-black inline-block"></span> Menang Angka</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 border border-black inline-block"></span> Menang Mutlak</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 border border-black inline-block"></span> Menang Teknik</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 border border-black inline-block"></span> Diskualifikasi</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 border border-black inline-block"></span> W.O. / Mundur</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4">
          <div className="space-y-16">
            <div>
              <div className="font-semibold">Mengetahui,</div>
              <div className="font-bold">Ketua Pertandingan</div>
            </div>
            <div>
              <div className="font-bold underline uppercase">( ............................................ )</div>
              <div className="text-[10px] text-slate-500 print:text-black">Tanda Tangan & Nama Terang</div>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <div className="font-semibold">Petugas Penilai,</div>
              <div className="font-bold">Wasit Juri {selectedJudgeNo}</div>
            </div>
            <div>
              <div className="font-bold underline uppercase">( ............................................ )</div>
              <div className="text-[10px] text-slate-500 print:text-black">Tanda Tangan & Lisensi Wasit Juri</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
