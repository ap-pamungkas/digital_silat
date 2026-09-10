"use client";

import * as React from "react";
import { Corner, PenaltyType } from "@/lib/types";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface PenaltyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPenalty: (corner: Corner, type: PenaltyType, points: number, note?: string) => void;
  redAthleteName: string;
  blueAthleteName: string;
}

export function PenaltyDialog({
  isOpen,
  onClose,
  onConfirmPenalty,
  redAthleteName,
  blueAthleteName,
}: PenaltyDialogProps) {
  const [selectedCorner, setSelectedCorner] = React.useState<Corner>("RED");
  const [selectedPenalty, setSelectedPenalty] = React.useState<{
    type: PenaltyType;
    label: string;
    points: number;
    description: string;
  }>({
    type: "TEGURAN_1",
    label: "Teguran 1",
    points: 1,
    description: "Pengurangan 1 Poin",
  });
  const [isConfirmStep, setIsConfirmStep] = React.useState(false);
  const [note, setNote] = React.useState("");

  const penalties: {
    type: PenaltyType;
    label: string;
    points: number;
    description: string;
  }[] = [
    { type: "TEGURAN_1", label: "Teguran 1", points: 1, description: "Pengurangan 1 Poin" },
    { type: "TEGURAN_2", label: "Teguran 2", points: 2, description: "Pengurangan 2 Poin" },
    { type: "PERINGATAN_1", label: "Peringatan 1 (P1)", points: 5, description: "Pengurangan 5 Poin" },
    { type: "PERINGATAN_2", label: "Peringatan 2 (P2)", points: 10, description: "Pengurangan 10 Poin" },
    { type: "DISKUALIFIKASI", label: "Diskualifikasi", points: 99, description: "Kalah Mutlak / Pelanggaran Berat" },
  ];

  const handleReset = React.useCallback(() => {
    setIsConfirmStep(false);
    setNote("");
    onClose();
  }, [onClose]);

  const handleApply = React.useCallback(() => {
    onConfirmPenalty(selectedCorner, selectedPenalty.type, selectedPenalty.points, note || selectedPenalty.label);
    handleReset();
  }, [onConfirmPenalty, selectedCorner, selectedPenalty, note, handleReset]);

  const targetAthlete = selectedCorner === "RED" ? redAthleteName : blueAthleteName;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleReset}
      title={isConfirmStep ? "Konfirmasi Hukuman Wasit" : "Berikan Hukuman / Penalti"}
      description={
        isConfirmStep
          ? "Pastikan keputusan wasit sudah tepat sebelum mengkonfirmasi pemotongan poin."
          : "Pilih sudut atlet dan jenis hukuman yang diputuskan oleh wasit."
      }
      maxWidth="md"
    >
      {!isConfirmStep ? (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">
              Pilih Sudut Atlet
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedCorner("RED")}
                className={cn(
                  "flex flex-col items-start p-3.5 rounded-lg border transition-colors text-left",
                  selectedCorner === "RED"
                    ? "bg-[#DC2626] text-white border-[#DC2626]"
                    : "bg-[#17191F] text-[#94A3B8] border-[#2A2D36] hover:border-[#DC2626]/50 hover:text-white"
                )}
              >
                <span className={cn(
                  "text-[11px] font-semibold uppercase tracking-wide",
                  selectedCorner === "RED" ? "text-white/80" : "text-[#FCA5A5]"
                )}>Sudut Merah</span>
                <span className="text-sm font-semibold mt-1 line-clamp-1 leading-5">{redAthleteName}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCorner("BLUE")}
                className={cn(
                  "flex flex-col items-start p-3.5 rounded-lg border transition-colors text-left",
                  selectedCorner === "BLUE"
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-[#17191F] text-[#94A3B8] border-[#2A2D36] hover:border-[#2563EB]/50 hover:text-white"
                )}
              >
                <span className={cn(
                  "text-[11px] font-semibold uppercase tracking-wide",
                  selectedCorner === "BLUE" ? "text-white/80" : "text-[#93C5FD]"
                )}>Sudut Biru</span>
                <span className="text-sm font-semibold mt-1 line-clamp-1 leading-5">{blueAthleteName}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">
              Jenis Pelanggaran / Hukuman
            </label>
            <div className="space-y-2">
              {penalties.map((item) => {
                const isSelected = selectedPenalty.type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setSelectedPenalty(item)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left",
                      isSelected
                        ? "bg-[#1F232C] border-[#F59E0B]/60 text-white"
                        : "bg-[#17191F] border-[#2A2D36] text-[#94A3B8] hover:bg-[#1F232C] hover:text-white"
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{item.description}</div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums px-2.5 py-1 rounded bg-[#F59E0B]/10 text-[#FCD34D] border border-[#F59E0B]/25 shrink-0">
                      -{item.points}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Batal
            </Button>
            <Button
              variant="warning"
              onClick={() => setIsConfirmStep(true)}
              className="flex-1"
            >
              Lanjutkan
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 py-2">
          <div className="p-4 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-center space-y-2.5">
            <ShieldAlert className="w-10 h-10 text-[#F59E0B] mx-auto" />
            <h3 className="text-base font-semibold text-white leading-6">
              Terapkan {selectedPenalty.label} kepada {selectedCorner === "RED" ? "Sudut Merah" : "Sudut Biru"}?
            </h3>
            <p className="text-sm text-[#FCD34D]/85 leading-5">
              Atlet: <span className="font-semibold text-white">{targetAthlete}</span>
              <br />
              Pengurangan: <span className="font-semibold text-[#FCD34D] tabular-nums">-{selectedPenalty.points} Poin</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-1.5">
              Catatan Wasit (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pukulan terlarang / Keluar gelanggang"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-10 rounded-lg border border-[#2A2D36] bg-[#17191F] px-3 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={() => setIsConfirmStep(false)} className="flex-1">
              Kembali
            </Button>
            <Button variant="danger" onClick={handleApply} className="flex-1">
              Konfirmasi Hukuman
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
