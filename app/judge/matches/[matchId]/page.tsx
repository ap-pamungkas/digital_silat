"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useScoring } from "@/lib/scoring-store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, ArrowRight, ShieldCheck, Trophy } from "lucide-react";

export default function JudgeMatchBriefingPage() {
  const params = useParams();
  const matchId = typeof params?.matchId === "string" ? params.matchId : "";
  const { matches, currentJudgeNumber } = useScoring();

  const match = matches.find((item) => item.id === matchId);

  if (!match) {
    return (
      <div className="mx-auto max-w-md py-12 text-center text-sm text-slate-500 dark:text-[#94A3B8]">
        Pertandingan tidak ditemukan di database.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/judge"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#94A3B8] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <Badge variant="outline" size="sm">
          Juri {currentJudgeNumber}
        </Badge>
      </div>

      <div className="rounded-xl border border-[#2A2D36] bg-[#17191F] p-6 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#2563EB]/10 text-[#60A5FA] border border-[#2563EB]/20 text-xs font-medium tabular-nums">
          <Trophy className="w-3.5 h-3.5 text-[#FCD34D]" />
          {match.arenaName} • {match.matchNumber}
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold text-white leading-7">
          {match.category}
        </h1>
        <p className="text-xs font-medium text-[#FCD34D]">
          {match.stage} • {match.totalRounds} Babak ({Math.floor(match.roundDurationSeconds / 60)} Menit / Babak)
        </p>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#2A2D36] text-left">
          <div className="p-3.5 rounded-lg border-l-[3px] border-[#DC2626] bg-[#1F232C] space-y-1">
            <div className="text-[11px] font-semibold text-[#FCA5A5] uppercase tracking-wide">
              Sudut Merah
            </div>
            <div className="text-sm font-medium text-white truncate leading-5">
              {match.redAthlete.name}
            </div>
            <div className="text-xs text-[#64748B] truncate">
              {match.redAthlete.contingent}
            </div>
          </div>

          <div className="p-3.5 rounded-lg border-l-[3px] border-[#2563EB] bg-[#1F232C] space-y-1">
            <div className="text-[11px] font-semibold text-[#93C5FD] uppercase tracking-wide">
              Sudut Biru
            </div>
            <div className="text-sm font-medium text-white truncate leading-5">
              {match.blueAthlete.name}
            </div>
            <div className="text-xs text-[#64748B] truncate">
              {match.blueAthlete.contingent}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[#2A2D36] bg-[#17191F] text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#60A5FA] font-semibold">
          <ShieldCheck className="w-4 h-4" />
          Panduan Penilaian Juri Silat
        </div>
        <ul className="list-disc list-inside text-[#94A3B8] space-y-1 pl-1">
          <li>Pukulan Masuk Sah: <span className="text-white font-medium">+1 Poin</span></li>
          <li>Tendangan Masuk Sah: <span className="text-white font-medium">+2 Poin</span></li>
          <li>Jatuhan Sah (Bantingan/Kuncian): <span className="text-white font-medium">+3 Poin</span></li>
        </ul>
      </div>

      <Link href={`/judge/scoring/${match.id}`} className="block">
        <Button variant="primary" size="lg" className="w-full h-14">
          <span>Mulai Penilaian Sekarang</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </Link>
    </div>
  );
}
