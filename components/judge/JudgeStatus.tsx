import * as React from "react";
import { ConnectionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface JudgeStatusProps {
  status: ConnectionStatus;
  showText?: boolean;
  pingMs?: number;
  className?: string;
}

export function JudgeStatus({
  status,
  showText = true,
  pingMs,
  className,
}: JudgeStatusProps) {
  const configs = {
    ONLINE: {
      label: "Terhubung",
      dot: "bg-[#22C55E]",
      text: "text-[#22C55E]",
    },
    SYNCING: {
      label: "Menyinkronkan",
      dot: "bg-[#3B82F6]",
      text: "text-[#3B82F6]",
    },
    RECONNECTING: {
      label: "Menghubungkan",
      dot: "bg-[#F59E0B]",
      text: "text-[#F59E0B]",
    },
    OFFLINE: {
      label: "Terputus",
      dot: "bg-[#EF4444]",
      text: "text-[#EF4444]",
    },
  };

  const current = configs[status] || configs.ONLINE;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-[#2A2D36] bg-[#1F232C] text-xs font-medium",
        className
      )}
    >
      <span className={cn("w-2 h-2 rounded-full", current.dot, status !== "OFFLINE" && "animate-live")} />
      {showText && <span className={current.text}>{current.label}</span>}
      {pingMs !== undefined && status === "ONLINE" && (
        <span className="text-[#64748B] tabular-nums">{pingMs}ms</span>
      )}
    </div>
  );
}
