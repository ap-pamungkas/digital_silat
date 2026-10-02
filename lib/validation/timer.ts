import { z } from "zod";
import { MATCH_TIMER_ACTIONS } from "@/lib/types";

export const matchTimerActionSchema = z.enum(MATCH_TIMER_ACTIONS);

export const updateTimerSchema = z
  .object({
    action: matchTimerActionSchema,
    round: z.number().int().optional(),
  })
  .refine((input) => input.action !== "SET_ROUND" || input.round !== undefined, {
    message: "Nomor babak wajib diisi untuk aksi SET_ROUND.",
    path: ["round"],
  });

export type UpdateTimerInput = z.infer<typeof updateTimerSchema>;