import { z } from "zod";

export const verifyJudgeSessionSchema = z.object({
  matchId: z.string().min(1),
  judgeNumber: z.number().int().min(1).max(5),
  accessCode: z.string().regex(/^[A-F0-9]{16}$/i),
});

export type VerifyJudgeSessionInput = z.infer<typeof verifyJudgeSessionSchema>;