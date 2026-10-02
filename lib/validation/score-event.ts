import { z } from "zod";
import { SCORING_ACTIONS } from "@/lib/types";
import { cornerSchema } from "./match";

export const scoringActionSchema = z.enum(SCORING_ACTIONS);

export const submitScoreEventSchema = z.object({
  corner: cornerSchema,
  action: scoringActionSchema,
  points: z.number().finite(),
  judgeNumber: z.number().int().min(1).max(5),
});

export const decideScoreEventSchema = z.object({
  decision: z.enum(["VERIFY", "REJECT"]),
});

export type SubmitScoreEventInput = z.infer<typeof submitScoreEventSchema>;
export type DecideScoreEventInput = z.infer<typeof decideScoreEventSchema>;