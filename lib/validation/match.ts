import { z } from "zod";
import {
  CORNERS,
  MATCH_STAGES,
  MATCH_STATUSES,
  MatchWinReason,
} from "@/lib/types";

export const cornerSchema = z.enum(CORNERS);
export const matchStageSchema = z.enum(MATCH_STAGES);
export const matchStatusSchema = z.enum(MATCH_STATUSES);
export const matchWinReasonSchema = z.enum([
  "MENANG_ANGKA",
  "MENANG_MUTLAK",
  "MENANG_TEKNIK",
  "MENANG_DISKUALIFIKASI",
  "MENANG_W_O",
  "MENANG_UNDUR_DIRI",
] satisfies readonly MatchWinReason[]);

export const createMatchSchema = z.object({
  tournamentId: z.string().min(1).optional(),
  arenaId: z.string().min(1),
  categoryId: z.string().min(1).optional(),
  categoryName: z.string().min(1).optional(),
  matchNumber: z.string().min(1),
  stage: matchStageSchema.optional(),
  redAthleteId: z.string().min(1),
  blueAthleteId: z.string().min(1),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
});

export const updateMatchScheduleSchema = z.object({
  arenaId: z.string().min(1),
  matchNumber: z.string().min(1),
  redAthleteId: z.string().min(1),
  blueAthleteId: z.string().min(1),
  stage: matchStageSchema,
  scheduledDate: z.string().min(1),
  scheduledTime: z.string().min(1),
});

export const updateMatchStatusSchema = z.object({
  matchId: z.string().min(1),
  status: matchStatusSchema,
  winnerCorner: cornerSchema.optional(),
  winReason: matchWinReasonSchema.optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchScheduleInput = z.infer<typeof updateMatchScheduleSchema>;
export type UpdateMatchStatusInput = z.infer<typeof updateMatchStatusSchema>;