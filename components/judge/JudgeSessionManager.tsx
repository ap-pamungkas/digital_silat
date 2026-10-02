"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { KeyRound, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks";
import { apiClient, JudgeSessionAccess } from "@/lib/api/client";

interface JudgeSessionManagerProps {
  matchId: string;
}

export function JudgeSessionManager({ matchId }: JudgeSessionManagerProps) {
  const { toast } = useToast();
  const [sessions, setSessions] = React.useState<JudgeSessionAccess[]>([]);
  const [copiedJudgeNumber, setCopiedJudgeNumber] = React.useState<number | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  React.useEffect(() => {
    let isCurrent = true;
    apiClient.judgeSessions
      .listByMatch(matchId)
      .then((existingSessions) => {
        if (isCurrent) setSessions(existingSessions);
      })
      .catch(() => {
        if (isCurrent) setSessions([]);
      });

    return () => {
      isCurrent = false;
    };
  }, [matchId]);

  const generateCode = async () => {
    setIsGenerating(true);
    try {
      const generatedSessions = await apiClient.judgeSessions.regenerate(matchId);
      setSessions(generatedSessions);
      toast.success("Kode Dibuat", `Kode akses untuk ${generatedSessions.length} juri telah diperbarui.`);
    } catch (error) {
      toast.error("Gagal Membuat Kode", error instanceof Error ? error.message : "Kode akses tidak dapat dibuat.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (session: JudgeSessionAccess) => {
    try {
      await navigator.clipboard.writeText(session.accessCode);
      setCopiedJudgeNumber(session.judgeNumber);
      setTimeout(() => setCopiedJudgeNumber(null), 2000);
      toast.info("Tersalin", `Kode akses Juri ${session.judgeNumber} telah disalin.`);
    } catch {
      toast.error("Gagal Menyalin", "Kode akses tidak dapat disalin ke clipboard.");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] p-5 space-y-4 shadow-xs transition-colors mt-6">
      <h3 className="text-xs font-bold text-slate-700 dark:text-[#94A3B8] flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-emerald-600 dark:text-[#22C55E]" />
        Manajemen Akses Juri
      </h3>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#17191F] border border-slate-100 dark:border-[#2A2D36]">
        <div className="space-y-1 text-sm">
          <p className="font-bold text-slate-900 dark:text-white">Kode Sesi Juri</p>
          <p className="text-slate-500 dark:text-[#94A3B8] text-xs">
            Setiap juri menggunakan kode sesuai nomor posisinya untuk masuk ke panel penilaian.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={generateCode}
          disabled={isGenerating}
          className="w-full sm:w-auto"
        >
          {isGenerating ? "Membuat..." : sessions.length ? "Perbarui Kode Akses" : "Buat Kode Akses"}
        </Button>
      </div>

      {sessions.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-[#273649]">
          {sessions.map((session) => (
            <div key={session.judgeNumber} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="text-sm font-semibold text-slate-700 dark:text-[#d5e3fd]">
                Juri {session.judgeNumber} · {session.judgeName}
              </span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 font-mono font-bold tracking-widest rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {session.accessCode}
                </span>
                <Button
                  variant="outline"
                  onClick={() => void copyToClipboard(session)}
                  className="shrink-0 h-10 px-3"
                  aria-label={`Salin kode Juri ${session.judgeNumber}`}
                >
                  {copiedJudgeNumber === session.judgeNumber
                    ? <Check className="w-4 h-4 text-emerald-500" />
                    : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
