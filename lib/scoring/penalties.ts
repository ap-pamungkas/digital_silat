import type { PenaltyType } from "@/lib/types";

/**
 * Penalty values are server-authoritative: the client only sends the penalty
 * type and the match deducts the amount defined here. This keeps the judge
 * device, the operator screen, the score display, and the OBS overlay on the
 * same number.
 */
export const PENALTY_POINTS: Record<PenaltyType, number> = {
  TEGURAN_1: 1,
  TEGURAN_2: 2,
  PERINGATAN_1: 5,
  PERINGATAN_2: 10,
  PERINGATAN_3: 15,
  DISKUALIFIKASI: 99,
};

export interface PenaltyOption {
  type: PenaltyType;
  label: string;
  points: number;
  description: string;
}

export const PENALTY_OPTIONS: readonly PenaltyOption[] = [
  { type: "TEGURAN_1", label: "Teguran 1", points: 1, description: "Pengurangan 1 Poin" },
  { type: "TEGURAN_2", label: "Teguran 2", points: 2, description: "Pengurangan 2 Poin" },
  { type: "PERINGATAN_1", label: "Peringatan 1 (P1)", points: 5, description: "Pengurangan 5 Poin" },
  { type: "PERINGATAN_2", label: "Peringatan 2 (P2)", points: 10, description: "Pengurangan 10 Poin" },
  { type: "PERINGATAN_3", label: "Peringatan 3 (P3)", points: 15, description: "Pengurangan 15 Poin" },
  {
    type: "DISKUALIFIKASI",
    label: "Diskualifikasi",
    points: 99,
    description: "Kalah Mutlak / Pelanggaran Berat",
  },
];

export function penaltyPointsForType(type: PenaltyType): number {
  return PENALTY_POINTS[type];
}

export function penaltyLabel(type: PenaltyType): string {
  return PENALTY_OPTIONS.find((option) => option.type === type)?.label ?? type;
}