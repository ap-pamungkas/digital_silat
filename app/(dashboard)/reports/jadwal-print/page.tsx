"use client";

import * as React from "react";
import Link from "next/link";
import { useScoring, useDashboard } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Printer, ArrowLeft, Trophy, Calendar, MapPin } from "lucide-react";

export default function JadwalPrintPage() {
  const { matches } = useScoring();
  const { tournament } = useDashboard();
  const [selectedArena, setSelectedArena] = React.useState<string>("ALL");

  const filteredMatches = React.useMemo(() => {
    if (selectedArena === "ALL") return matches;
    return matches.filter((m) => m.arenaId === selectedArena);
  }, [matches, selectedArena]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070d18] p-4 sm:p-8 text-slate-900 print:bg-white print:p-0 print:text-black">
      {/* Control Toolbar (Hidden when printing) */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Laporan
            </Button>
          </Link>
          <div className="text-sm font-semibold text-slate-700 dark:text-[#94A3B8]">
            Pratinjau Cetak Jadwal Partai Pertandingan
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedArena}
            onChange={(e) => setSelectedArena(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#273649] bg-white dark:bg-[#122033] text-sm text-slate-900 dark:text-white"
          >
            <option value="ALL">Semua Gelanggang</option>
            <option value="ARENA-01">Gelanggang 1 (ARENA-01)</option>
            <option value="ARENA-02">Gelanggang 2 (ARENA-02)</option>
            <option value="ARENA-03">Gelanggang 3 (ARENA-03)</option>
            <option value="ARENA-04">Gelanggang 4 (ARENA-04)</option>
          </select>

          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak Jadwal (Print / PDF)
          </Button>
        </div>
      </div>

      {/* Printable Sheet (A4 format) */}
      <div className="max-w-5xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
        {/* Official Header / KOP */}
        <div className="border-b-2 border-black pb-4 mb-6 text-center">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-600 print:text-black">
            IKATAN PENCAK SILAT INDONESIA (IPSI)
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 print:text-black mt-1">
            {tournament.name || "KEJUARAAN PENCAK SILAT"}
          </h1>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-700 print:text-black mt-1.5">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 inline print:hidden" />
              {tournament.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 inline print:hidden" />
              {tournament.startDate} - {tournament.endDate}
            </span>
          </div>
          <div className="mt-2 inline-block px-3 py-0.5 rounded bg-slate-100 print:bg-transparent border border-slate-300 print:border-black text-xs font-bold uppercase">
            JADWAL PERTANDINGAN KATEGORI TANDING {selectedArena !== "ALL" ? `— ${selectedArena}` : ""}
          </div>
        </div>

        {/* Matches Table */}
        <table className="w-full text-left text-xs border-collapse border border-black mb-8">
          <thead>
            <tr className="bg-slate-200 print:bg-slate-100 border-b border-black text-center font-bold">
              <th className="border border-black px-2 py-2 w-10">NO</th>
              <th className="border border-black px-2 py-2 w-20">PARTAI</th>
              <th className="border border-black px-2 py-2 w-24">GELANGGANG</th>
              <th className="border border-black px-3 py-2">KELAS & BABAK</th>
              <th className="border border-black px-3 py-2 bg-red-100 print:bg-red-50 text-red-900 print:text-black w-44">
                SUDUT MERAH
              </th>
              <th className="border border-black px-2 py-2 w-12">SKOR</th>
              <th className="border border-black px-3 py-2 bg-blue-100 print:bg-blue-50 text-blue-900 print:text-black w-44">
                SUDUT BIRU
              </th>
              <th className="border border-black px-2 py-2 w-24">STATUS / WAKTU</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((m, idx) => (
              <tr key={m.id} className="border-b border-slate-300 print:border-black">
                <td className="border border-black text-center font-medium py-2 px-1">
                  {idx + 1}
                </td>
                <td className="border border-black text-center font-bold py-2 px-1">
                  {m.matchNumber}
                </td>
                <td className="border border-black text-center font-semibold py-2 px-1">
                  {m.arenaName}
                </td>
                <td className="border border-black py-2 px-2">
                  <div className="font-bold">{m.category}</div>
                  <div className="text-[10px] text-slate-600 print:text-black">{m.stage}</div>
                </td>
                <td className="border border-black py-2 px-2">
                  <div className="font-bold text-red-700 print:text-black">{m.redAthlete.name}</div>
                  <div className="text-[10px] font-semibold text-slate-600 print:text-black">
                    {m.redAthlete.contingent} {m.redAthlete.contingentCode ? `(${m.redAthlete.contingentCode})` : ""}
                  </div>
                </td>
                <td className="border border-black text-center font-mono font-bold py-2 px-1">
                  {m.status === "FINISHED" ? `${m.redScore} - ${m.blueScore}` : "-"}
                </td>
                <td className="border border-black py-2 px-2">
                  <div className="font-bold text-blue-700 print:text-black">{m.blueAthlete.name}</div>
                  <div className="text-[10px] font-semibold text-slate-600 print:text-black">
                    {m.blueAthlete.contingent} {m.blueAthlete.contingentCode ? `(${m.blueAthlete.contingentCode})` : ""}
                  </div>
                </td>
                <td className="border border-black text-center py-2 px-1">
                  <span className="font-semibold text-[11px]">
                    {m.status === "FINISHED" ? "SELESAI" : m.status === "LIVE" ? "SEDANG BERTANDING" : m.scheduledTime || "ANTREAN"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs pt-6">
          <div className="space-y-16">
            <div>
              <div className="font-semibold">Mengetahui,</div>
              <div className="font-bold">Ketua Pertandingan</div>
            </div>
            <div>
              <div className="font-bold underline uppercase">( ............................................ )</div>
              <div className="text-[10px] text-slate-500 print:text-black">NIP / Lisensi Wasit Juri</div>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <div className="font-semibold">Panitia Pelaksana,</div>
              <div className="font-bold">Sekretaris Pertandingan</div>
            </div>
            <div>
              <div className="font-bold underline uppercase">( ............................................ )</div>
              <div className="text-[10px] text-slate-500 print:text-black">Sekretariat Kejuaraan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
