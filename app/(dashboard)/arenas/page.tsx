"use client";

import * as React from "react";
import Link from "next/link";
import { useScoring, useArenas } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatTime } from "@/lib/utils";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { Arena } from "@/lib/types";
import {
  Grid3X3,
  Tv,
  Cast,
  Radio,
  ExternalLink,
} from "lucide-react";

export default function ArenasPage() {
  const { matches } = useScoring();
  const { arenas, isLoading } = useArenas();

  const getCurrentMatch = (arena: Arena) =>
    matches.find((match) => match.id === arena.currentMatchId) ||
    matches.find((match) => match.arenaId === arena.id && match.status === "LIVE") ||
    matches.find((match) => match.arenaId === arena.id && ["READY", "SCHEDULED"].includes(match.status));

  const columns: Column<Arena>[] = [
    {
      header: "Gelanggang",
      cell: (arena) => (
        <div className="min-w-32">
          <div className="font-bold text-slate-900 dark:text-white">{arena.name}</div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-[#94A3B8]">{arena.id}</div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (arena) => (
        <Badge variant={arena.status === "ACTIVE" ? "live" : arena.status === "MAINTENANCE" ? "warning" : "default"}>
          {arena.status === "ACTIVE" ? "Aktif" : arena.status === "MAINTENANCE" ? "Pemeliharaan" : "Siap"}
        </Badge>
      ),
    },
    {
      header: "Partai",
      cell: (arena) => {
        const match = getCurrentMatch(arena);
        return match ? (
          <div className="min-w-36">
            <div className="font-semibold text-slate-900 dark:text-white">{match.matchNumber}</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8]">{match.category}</div>
          </div>
        ) : <span className="text-slate-400">-</span>;
      },
    },
    {
      header: "Skor",
      cell: (arena) => {
        const match = getCurrentMatch(arena);
        return match ? (
          <div className="min-w-36 space-y-1 text-xs">
            <div className="flex justify-between gap-3"><span className="truncate">{match.redAthlete.name}</span><strong className="tabular-nums text-red-600 dark:text-red-400">{match.redScore}</strong></div>
            <div className="flex justify-between gap-3"><span className="truncate">{match.blueAthlete.name}</span><strong className="tabular-nums text-blue-600 dark:text-blue-400">{match.blueScore}</strong></div>
          </div>
        ) : <span className="text-slate-400">-</span>;
      },
    },
    {
      header: "Babak / Waktu",
      cell: (arena) => {
        const match = getCurrentMatch(arena);
        return match ? (
          <div className="whitespace-nowrap text-xs">
            <div>Babak {match.currentRound}/{match.totalRounds}</div>
            <div className="mt-0.5 font-semibold tabular-nums text-emerald-600 dark:text-[#22C55E]">{formatTime(match.timeRemainingSeconds)}</div>
          </div>
        ) : <span className="text-slate-400">-</span>;
      },
    },
    {
      header: "Juri",
      className: "text-center",
      cell: (arena) => <span className="tabular-nums">{arena.connectedJudgesCount}/{arena.totalJudgesCount}</span>,
    },
    {
      header: "Display / OBS",
      cell: (arena) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={arena.displayConnected ? "success" : "default"}>TV {arena.displayConnected ? "Online" : "Offline"}</Badge>
          <Badge variant={arena.obsConnected ? "success" : "default"}>OBS {arena.obsConnected ? "Online" : "Offline"}</Badge>
        </div>
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (arena) => {
        const match = getCurrentMatch(arena);
        return (
          <div className="flex justify-end gap-1">
            <Link href={`/display/${arena.id}`} target="_blank" title="Buka TV display" aria-label={`Buka TV ${arena.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-emerald-600 hover:bg-slate-100 dark:hover:bg-[#1c2b3e]">
              <Tv className="h-4 w-4" />
              <ExternalLink className="sr-only" />
            </Link>
            <Link href={`/overlay/${arena.id}`} target="_blank" title="Buka OBS overlay" aria-label={`Buka OBS ${arena.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-purple-600 hover:bg-slate-100 dark:hover:bg-[#1c2b3e]">
              <Cast className="h-4 w-4" />
            </Link>
            {match ? (
              <Link href={`/live-scoring/${match.id}`} title="Kontrol live" aria-label={`Kontrol ${match.matchNumber}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-amber-600 hover:bg-slate-100 dark:hover:bg-[#1c2b3e]">
                <Radio className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#d5e3fd] flex items-center gap-2 leading-7">
            <Grid3X3 className="w-6 h-6 text-amber-600 dark:text-[#ffd165]" />
            Manajemen Gelanggang Pertandingan
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#d3c5ac] mt-1">
            Status arena pertandingan, koneksi wasit juri, display TV scoreboard, dan stream OBS
          </p>
        </div>
      </div>

      {isLoading ? (
        <DataTable
          data={[]}
          columns={columns}
          keyExtractor={(arena) => arena.id}
          isLoading={true}
        />
      ) : arenas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#273649] p-12 text-center bg-white/50 dark:bg-[#0d1c2f]/50">
          <Grid3X3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Gelanggang</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 max-w-sm mx-auto">
            Buat kejuaraan baru di menu Manajemen Turnamen untuk mengalokasikan gelanggang pertandingan secara otomatis.
          </p>
          <div className="mt-4">
            <Link href="/tournaments">
              <Button variant="primary" size="sm">
                Buka Manajemen Turnamen
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <DataTable
          data={arenas}
          columns={columns}
          keyExtractor={(arena) => arena.id}
          emptyMessage="Belum ada data gelanggang."
        />
      )}
    </div>
  );
}
