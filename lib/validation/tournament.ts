import { z } from "zod";
import { TOURNAMENT_STATUSES } from "@/lib/types";
import { optionalText } from "./common";

export const createTournamentSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalArenas: z.union([z.string(), z.number()]).optional(),
});

export const updateTournamentSchema = z
  .object({
    name: z.string().min(1).optional(),
    location: z.string().optional(),
    startDate: optionalText,
    endDate: optionalText,
    status: z.enum(TOURNAMENT_STATUSES).optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "Tidak ada perubahan yang dikirim.",
  });

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;