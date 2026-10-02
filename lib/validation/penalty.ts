import { z } from "zod";
import { PENALTY_TYPES } from "@/lib/types";
import { optionalText } from "./common";
import { cornerSchema } from "./match";

export const penaltyTypeSchema = z.enum(PENALTY_TYPES);

/**
 * The deducted amount is intentionally absent: the server derives it from
 * `type` so a device cannot apply an arbitrary point deduction.
 */
export const createPenaltySchema = z.object({
  corner: cornerSchema,
  type: penaltyTypeSchema,
  refereeNote: optionalText.pipe(z.string().max(200).optional()),
});

export type CreatePenaltyInput = z.infer<typeof createPenaltySchema>;