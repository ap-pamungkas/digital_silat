"use client";

import * as React from "react";
import Link from "next/link";
import { useDashboard } from "@/hooks";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  MapPin,
  Calendar,
  Layers,
  User,
  Swords,
  Clock,
  UserPlus,
  Users,
  CalendarPlus,
  Printer,
  FileText,
  ClipboardList,
  Download,
  History,
  Bolt,
  FolderOpen,
  Settings2,
  Tv,
  Play,
  Plus,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { tournament, stats, matches, arenas, activeMatch, auditLogs } = useDashboard();

  const todayMatches = matches.slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-amber-600 dark:text-[#ffd165] tracking-widest uppercase mb-1 flex items-center gap-2">
            PAGAR <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-[#ffd165]" /> ALE-ALE EDITION
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#d5e3fd] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#d3c5ac] mt-1">
            Ringkasan administrasi dan kegiatan pertandingan hari ini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {tournament && tournament.id && tournament.id !== "TOUR-DEFAULT" ? (
            <Link
              href="/tournaments"
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-[#4f4633] rounded-lg text-slate-700 dark:text-[#d5e3fd] bg-white dark:bg-[#0d1c2f] hover:bg-slate-50 dark:hover:bg-[#1c2b3e] hover:border-amber-500 dark:hover:border-[#ffd165] transition-colors text-xs sm:text-sm font-medium shadow-xs"
            >
              <Calendar className="w-4 h-4 text-amber-600 dark:text-[#ffd165]" />
              <span>{tournament.name}</span>
            </Link>
          ) : null}
          <Link
            href="/tournaments"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 dark:bg-[#eab308] dark:hover:bg-[#f7be1d] text-slate-950 dark:text-[#604700] rounded-lg transition-colors text-xs sm:text-sm font-bold shadow-xs active:scale-95"
          >
            <Settings2 className="w-4 h-4" />
            <span>Kelola Turnamen</span>
          </Link>
        </div>
      </div>

      {/* 2. Tournament Summary Banner */}
      {tournament && tournament.id && tournament.id !== "TOUR-DEFAULT" ? (
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] p-6 shadow-xs">
          <div className="absolute inset-0 awan-larat-bg opacity-40 mix-blend-overlay pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center justify-between w-full">
            <div className="flex flex-wrap items-center gap-6 sm:gap-10">
              {/* Lokasi */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-[#273649] border border-amber-200/60 dark:border-[#4f4633] flex items-center justify-center text-amber-600 dark:text-[#ffd165] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94a3b8]">
                    LOKASI
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#d5e3fd]">
                    {tournament.location}
                  </p>
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-[#273649]" />

              {/* Tanggal */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-[#273649] border border-amber-200/60 dark:border-[#4f4633] flex items-center justify-center text-amber-600 dark:text-[#ffd165] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94a3b8]">
                    TANGGAL
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#d5e3fd]">
                    {tournament.startDate} – {tournament.endDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-2 md:mt-0">
              <div className="px-4 py-2 bg-amber-50 dark:bg-[#eab308]/15 border border-amber-300 dark:border-[#ffd165]/35 rounded-full flex items-center gap-2.5 shadow-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 dark:bg-[#ffd165] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 dark:bg-[#ffd165]" />
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-[#ffd165] tracking-wider">
                  {tournament.status === "ONGOING" ? "SEDANG BERLANGSUNG" : tournament.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#0d1c2f] border border-dashed border-slate-300 dark:border-[#273649] p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Turnamen Aktif</h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                Silakan buat atau pilih kejuaraan di menu Turnamen untuk memulai pengelolaan gelanggang, atlet, dan jadwal partai.
              </p>
            </div>
            <Link
              href="/tournaments"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 dark:bg-[#eab308] dark:hover:bg-[#f7be1d] text-slate-950 dark:text-[#604700] rounded-lg transition-colors text-xs sm:text-sm font-bold shadow-xs active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Turnamen Baru</span>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Primary Statistics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Atlet"
          value={stats.totalAthletes}
          subValue="Dari 10+ kontingen"
          icon={<User className="w-5 h-5" />}
        />

        <StatCard
          title="Total Pertandingan"
          value={stats.totalMatches}
          subValue={`${stats.finishedMatches} telah selesai`}
          icon={<Swords className="w-5 h-5" />}
        />

        <StatCard
          title="Gelanggang Aktif"
          value={stats.totalArenas}
          subValue="Gelanggang 1, 2, 3, 4"
          icon={<Layers className="w-5 h-5" />}
          badge={
            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-[#14532d]/40 text-emerald-700 dark:text-[#4ade80] border border-emerald-200 dark:border-[#166534] rounded text-[11px] font-bold tracking-wider">
              AKTIF
            </span>
          }
        />

        <StatCard
          title="Pertandingan Hari Ini"
          value={stats.matchesToday}
          subValue={`${stats.finishedMatches} telah selesai (${Math.round((stats.finishedMatches / Math.max(1, stats.totalMatches)) * 100)}%)`}
          icon={<Clock className="w-5 h-5" />}
          progress={{ percentage: Math.round((stats.finishedMatches / Math.max(1, stats.totalMatches)) * 100) }}
        />
      </div>

      {/* 4. Main Content Split View (8 cols vs 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Jadwal Pertandingan (8 Cols / 65%) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] rounded-xl flex flex-col shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#273649] flex justify-between items-center bg-slate-50/80 dark:bg-[#273649]/30">
            <h2 className="text-base font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-[#ffd165]" />
              Jadwal Pertandingan Hari Ini
            </h2>
            <Link
              href="/matches"
              className="text-amber-600 hover:text-amber-700 dark:text-[#ffd165] dark:hover:text-[#f7be1d] text-xs font-semibold hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#273649] bg-slate-50/50 dark:bg-[#273649]/20 text-[11px] font-bold text-slate-400 dark:text-[#94a3b8] tracking-wider uppercase">
                  <th className="p-3.5 pl-5 whitespace-nowrap">PARTAI</th>
                  <th className="p-3.5 text-center whitespace-nowrap">GELANGGANG</th>
                  <th className="p-3.5 whitespace-nowrap">KELAS</th>
                  <th className="p-3.5 whitespace-nowrap">SUDUT MERAH</th>
                  <th className="p-3.5 whitespace-nowrap">SUDUT BIRU</th>
                  <th className="p-3.5 whitespace-nowrap">WAKTU</th>
                  <th className="p-3.5 pr-5 whitespace-nowrap">STATUS</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 dark:divide-[#273649]">
                {todayMatches.length ? todayMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-slate-50 dark:hover:bg-[#1c2b3e]/60 transition-colors group">
                    <td className="p-3.5 pl-5 font-bold text-slate-900 dark:text-[#d5e3fd]">
                      {match.matchNumber.replace("MATCH ", "")}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex w-7 h-7 items-center justify-center bg-amber-50 dark:bg-[#273649] rounded border border-amber-200 dark:border-[#4f4633] font-bold text-amber-700 dark:text-[#ffd165]">
                        {match.arenaId.replace("ARENA-0", "").replace("ARENA-", "")}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-[#d3c5ac]">{match.category.replace("TANDING - ", "")}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-red-600 rounded-xs" />
                        <span className="font-semibold text-slate-900 dark:text-[#d5e3fd]">{match.redAthlete.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-blue-600 rounded-xs" />
                        <span className="font-semibold text-slate-900 dark:text-[#d5e3fd]">{match.blueAthlete.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-[#d3c5ac] font-mono">{match.scheduledTime}</td>
                    <td className="p-3.5 pr-5">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${
                        match.status === "LIVE"
                          ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-[#eab308]/20 dark:text-[#ffd165] dark:border-[#ffd165]/35"
                          : match.status === "FINISHED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                          : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-[#273649] dark:text-[#d3c5ac] dark:border-[#273649]"
                      }`}>
                        {match.status === "LIVE" ? "BERLANGSUNG" : match.status === "FINISHED" ? "SELESAI" : "TERJADWAL"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-[#94a3b8]">
                      Belum ada data pertandingan di database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Status Gelanggang (4 Cols / 35%) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600 dark:text-[#ffd165]" />
              Status Gelanggang
            </h2>
            <Link
              href="/arenas"
              className="text-xs text-slate-500 dark:text-[#94a3b8] hover:text-amber-600 dark:hover:text-[#ffd165] transition-colors"
            >
              Semua Gelanggang
            </Link>
          </div>

          {arenas.length ? arenas.map((arena, index) => {
            const arenaMatch =
              matches.find((match) => match.id === arena.currentMatchId) ||
              (activeMatch?.arenaId === arena.id && activeMatch.status === "LIVE" ? activeMatch : null) ||
              matches.find((match) => match.arenaId === arena.id && match.status === "LIVE") ||
              matches.find((match) => match.arenaId === arena.id && ["READY", "SCHEDULED"].includes(match.status));
            const isLive = arenaMatch?.status === "LIVE";

            return (
              <div key={arena.id} className={`bg-white dark:bg-[#0d1c2f] border ${isLive ? "border-amber-300 dark:border-[#eab308]/40" : "border-slate-200 dark:border-[#273649]"} rounded-xl p-4 shadow-xs relative overflow-hidden`}>
                {isLive ? (
                  <div className="absolute right-0 top-0 w-16 h-16 bg-amber-500/10 dark:bg-[#ffd165]/10 rounded-bl-full flex items-start justify-end p-3 pointer-events-none">
                    <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-[#ffd165] mt-1 mr-1" />
                  </div>
                ) : null}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg ${isLive ? "bg-amber-500 dark:bg-[#eab308] text-slate-950 dark:text-[#604700]" : "bg-slate-100 dark:bg-[#273649] border border-slate-200 dark:border-[#273649] text-slate-700 dark:text-[#d5e3fd]"}`}>
                    {arena.id.replace("ARENA-0", "").replace("ARENA-", "") || index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-[#d5e3fd] text-sm">{arena.name}</h3>
                    <p className={`text-[10px] font-bold tracking-wider ${isLive ? "text-amber-600 dark:text-[#ffd165]" : "text-slate-500 dark:text-[#d3c5ac]"}`}>
                      {isLive ? "SEDANG BERLANGSUNG" : arenaMatch ? "SIAP (BERIKUTNYA)" : arena.status === "MAINTENANCE" ? "PEMELIHARAAN" : "TIDAK AKTIF"}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-[#273649]/40 rounded-lg p-3 border border-slate-200 dark:border-[#273649]">
                  {arenaMatch ? (
                    <>
                      <div className="flex justify-between items-center mb-2 text-xs">
                        <span className="text-slate-600 dark:text-[#d3c5ac]">Partai <strong className="text-slate-900 dark:text-[#d5e3fd]">{arenaMatch.matchNumber}</strong></span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-white dark:bg-[#051426] rounded border border-slate-200 dark:border-[#273649] text-amber-600 dark:text-[#ffd165]">Babak {arenaMatch.currentRound}/{arenaMatch.totalRounds}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold gap-2">
                        <span className="truncate text-slate-900 dark:text-[#d5e3fd]"><span className="text-red-600">{arenaMatch.redScore}</span> {arenaMatch.redAthlete.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-[#94a3b8]">VS</span>
                        <span className="truncate text-right text-slate-900 dark:text-[#d5e3fd]">{arenaMatch.blueAthlete.name} <span className="text-blue-600">{arenaMatch.blueScore}</span></span>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-[#273649]/80 flex items-center justify-between text-[11px]">
                        <Link href={`/live-scoring/${arenaMatch.id}`} className="text-amber-600 hover:text-amber-700 dark:text-[#ffd165] dark:hover:text-[#f7be1d] font-semibold flex items-center gap-1"><Play className="w-3 h-3 fill-current" /> Kontrol Juri</Link>
                        <Link href={`/display/${arena.id}`} target="_blank" className="text-slate-500 hover:text-slate-900 dark:text-[#94a3b8] dark:hover:text-white flex items-center gap-1"><Tv className="w-3 h-3 text-emerald-500" /> Layar TV</Link>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-[#94a3b8]">Belum ada pertandingan terjadwal.</p>
                  )}
                </div>
              </div>
            );
          }) : (
            <p className="rounded-xl border border-dashed border-slate-300 dark:border-[#273649] p-5 text-xs text-slate-500 dark:text-[#94a3b8]">Belum ada data gelanggang di database.</p>
          )}
        </div>
      </div>

      {/* 5. Bottom Bento Sections: Akses Cepat, Dokumen, Aktivitas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Akses Cepat */}
        <div className="bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#d5e3fd] mb-4 flex items-center gap-2">
              <Bolt className="w-4 h-4 text-amber-600 dark:text-[#ffd165]" />
              Akses Cepat
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/athletes"
                className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-amber-50 dark:bg-[#273649] dark:hover:bg-[#1c2b3e] border border-slate-200 dark:border-[#273649] rounded-lg hover:border-amber-400 dark:hover:border-[#ffd165] transition-all text-slate-700 dark:text-[#d3c5ac] gap-2 group active:scale-95"
              >
                <UserPlus className="w-5 h-5 text-amber-600 dark:text-[#ffd165] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-center">Tambah Atlet</span>
              </Link>

              <Link
                href="/tournaments"
                className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-amber-50 dark:bg-[#273649] dark:hover:bg-[#1c2b3e] border border-slate-200 dark:border-[#273649] rounded-lg hover:border-amber-400 dark:hover:border-[#ffd165] transition-all text-slate-700 dark:text-[#d3c5ac] gap-2 group active:scale-95"
              >
                <Users className="w-5 h-5 text-amber-600 dark:text-[#ffd165] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-center">Tambah Kontingen</span>
              </Link>

              <Link
                href="/matches"
                className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-amber-50 dark:bg-[#273649] dark:hover:bg-[#1c2b3e] border border-slate-200 dark:border-[#273649] rounded-lg hover:border-amber-400 dark:hover:border-[#ffd165] transition-all text-slate-700 dark:text-[#d3c5ac] gap-2 group active:scale-95"
              >
                <CalendarPlus className="w-5 h-5 text-amber-600 dark:text-[#ffd165] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-center">Buat Jadwal</span>
              </Link>

              <Link
                href="/reports"
                className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-amber-50 dark:bg-[#273649] dark:hover:bg-[#1c2b3e] border border-slate-200 dark:border-[#273649] rounded-lg hover:border-amber-400 dark:hover:border-[#ffd165] transition-all text-slate-700 dark:text-[#d3c5ac] gap-2 group active:scale-95"
              >
                <Printer className="w-5 h-5 text-amber-600 dark:text-[#ffd165] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-center">Cetak Dokumen</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dokumen Pertandingan */}
        <div className="bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] rounded-xl p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-[#d5e3fd] mb-4 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-amber-600 dark:text-[#ffd165]" />
            Dokumen Pertandingan
          </h2>
          <div className="space-y-3">
            <Link
              href="/reports"
              className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#273649] rounded-lg border border-slate-200 dark:border-[#273649] hover:bg-amber-50/50 dark:hover:bg-[#1c2b3e] hover:border-amber-300 dark:hover:border-[#4f4633] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400 dark:text-[#94a3b8] group-hover:text-amber-600 dark:group-hover:text-[#ffd165] transition-colors" />
                <span className="text-xs font-semibold text-slate-800 dark:text-[#d5e3fd]">Jadwal Tanding</span>
              </div>
              <Download className="w-4 h-4 text-slate-400 dark:text-[#94a3b8] group-hover:text-amber-600 dark:group-hover:text-[#ffd165] transition-colors" />
            </Link>

            <Link
              href="/reports"
              className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#273649] rounded-lg border border-slate-200 dark:border-[#273649] hover:bg-amber-50/50 dark:hover:bg-[#1c2b3e] hover:border-amber-300 dark:hover:border-[#4f4633] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4 text-slate-400 dark:text-[#94a3b8] group-hover:text-amber-600 dark:group-hover:text-[#ffd165] transition-colors" />
                <span className="text-xs font-semibold text-slate-800 dark:text-[#d5e3fd]">Form Nilai Tanding</span>
              </div>
              <Download className="w-4 h-4 text-slate-400 dark:text-[#94a3b8] group-hover:text-amber-600 dark:group-hover:text-[#ffd165] transition-colors" />
            </Link>
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white dark:bg-[#0d1c2f] border border-slate-200 dark:border-[#273649] rounded-xl p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-[#d5e3fd] mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-600 dark:text-[#ffd165]" />
            Aktivitas Terbaru
          </h2>
          <div className="space-y-4">
            {auditLogs.length ? auditLogs.map((log, index) => (
              <div key={log.id} className="flex gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${index === 0 ? "bg-amber-500 dark:bg-[#ffd165]" : "bg-slate-300 dark:bg-[#273649]"} mt-1 shrink-0 ring-4 ring-slate-100 dark:ring-[#0d1c2f]`} />
                <div className="min-w-0">
                  <p className="text-xs text-slate-900 dark:text-[#d5e3fd] font-medium leading-tight">{log.action.replace(/_/g, " ")}</p>
                  {log.details ? <p className="text-[10px] text-slate-500 dark:text-[#94a3b8] mt-0.5 truncate">{log.details}</p> : null}
                  <p className="text-[10px] text-slate-400 dark:text-[#94a3b8] mt-0.5">{new Date(log.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-500 dark:text-[#94a3b8]">Belum ada aktivitas yang tercatat.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
