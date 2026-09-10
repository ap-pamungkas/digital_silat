"use client";

import * as React from "react";
import Link from "next/link";
import { useScoring, useArenas } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatTime } from "@/lib/utils";
import {
  Grid3X3,
  Tv,
  Cast,
  Radio,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function ArenasPage() {
  const { matches } = useScoring();
  const { arenas } = useArenas();

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

      {arenas.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arenas.map((arena, idx) => {
            const currentMatch = matches.find((m) => m.arenaId === arena.id && m.status !== "FINISHED") || matches.find((m) => m.arenaId === arena.id);

            return (
              <div
                key={`${arena.id}-${idx}`}
                className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] overflow-hidden flex flex-col justify-between shadow-xs transition-colors"
              >
              <div className="p-5 border-b border-slate-100 dark:border-[#273649] flex items-center justify-between bg-slate-50/70 dark:bg-[#1F232C]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 dark:bg-[#273649] dark:text-[#ffd165] dark:border-[#4f4633] flex items-center justify-center font-black tabular-nums text-lg shadow-xs">
                    {arena.id.replace("ARENA-0", "G")}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-6">
                      {arena.name}
                    </h2>
                    <span className="text-xs text-slate-400 dark:text-[#64748B] tabular-nums">
                      ID: {arena.id}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={arena.status === "ACTIVE" ? "live" : "default"}
                  size="md"
                >
                  {arena.status === "ACTIVE" ? "Aktif" : "Siap"}
                </Badge>
              </div>

              <div className="p-5 space-y-4">
                {currentMatch ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8]">
                      <span className="tabular-nums font-semibold">{currentMatch.matchNumber}</span>
                      <span className="text-slate-800 dark:text-white font-medium">{currentMatch.category}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border border-red-200 dark:border-[#DC2626]/20 bg-red-50/50 dark:bg-[#DC2626]/10 flex items-center justify-between min-w-0">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-red-600 dark:text-[#FCA5A5] uppercase tracking-wide">Merah</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white truncate leading-5">
                            {currentMatch.redAthlete.name}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-2xl tabular-nums text-red-600 dark:text-white">
                          {currentMatch.redScore}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border border-blue-200 dark:border-[#2563EB]/20 bg-blue-50/50 dark:bg-[#2563EB]/10 flex items-center justify-between min-w-0">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-blue-600 dark:text-[#93C5FD] uppercase tracking-wide">Biru</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white truncate leading-5">
                            {currentMatch.blueAthlete.name}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-2xl tabular-nums text-blue-600 dark:text-white">
                          {currentMatch.blueScore}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#1F232C] border border-slate-200 dark:border-[#2A2D36] text-xs">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-[#ffd165]" />
                        <span>Babak {currentMatch.currentRound} / {currentMatch.totalRounds}</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-[#22C55E] tabular-nums">
                        {formatTime(currentMatch.timeRemainingSeconds)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-[#64748B]">
                    Tidak ada partai yang sedang aktif di gelanggang ini.
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#122033] border border-slate-200 dark:border-[#273649] text-center">
                    <div className="text-slate-500 dark:text-[#64748B]">Wasit Juri</div>
                    <div className="font-bold text-emerald-600 dark:text-[#22C55E] mt-0.5 tabular-nums">5 / 5</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#122033] border border-slate-200 dark:border-[#273649] text-center">
                    <div className="text-slate-500 dark:text-[#64748B]">Layar TV</div>
                    <div className="font-bold text-emerald-600 dark:text-[#22C55E] mt-0.5">Online</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#122033] border border-slate-200 dark:border-[#273649] text-center">
                    <div className="text-slate-500 dark:text-[#64748B]">OBS HUD</div>
                    <div className="font-bold text-purple-600 dark:text-[#A855F7] mt-0.5">Online</div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 dark:border-[#273649] flex flex-wrap items-center justify-between gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/display/${arena.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1F232C] dark:hover:bg-[#272C37] text-xs font-semibold text-emerald-700 dark:text-[#22C55E] border border-slate-200 dark:border-[#2A2D36] transition-colors"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>TV Display</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 dark:text-[#64748B] ml-0.5" />
                  </Link>

                  <Link
                    href={`/overlay/${arena.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1F232C] dark:hover:bg-[#272C37] text-xs font-semibold text-purple-700 dark:text-[#A855F7] border border-slate-200 dark:border-[#2A2D36] transition-colors"
                  >
                    <Cast className="w-3.5 h-3.5" />
                    <span>OBS HUD</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 dark:text-[#64748B] ml-0.5" />
                  </Link>
                </div>

                {currentMatch && (
                  <Link href={`/live-scoring/${currentMatch.id}`}>
                    <Button variant="primary" size="sm">
                      <Radio className="w-3.5 h-3.5 mr-1.5" />
                      Kontrol Live
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
