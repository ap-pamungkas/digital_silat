import { z } from "zod";
import { ConnectionStatus } from "@/lib/types";

export const connectionStatusSchema = z.enum([
  "ONLINE",
  "SYNCING",
  "RECONNECTING",
  "OFFLINE",
] satisfies readonly ConnectionStatus[]);

export const createJudgeSchema = z.object({
  arenaId: z.string().min(1),
  judgeNumber: z.number().int().min(1).max(5),
  name: z.string().min(1),
  licenseNumber: z.string().optional(),
});

export const updateJudgeSchema = z.object({
  name: z.string().min(1).optional(),
  licenseNumber: z.string().optional(),
  status: connectionStatusSchema.optional(),
  pingMs: z.number().finite().optional(),
  batteryLevel: z.number().finite().min(0).max(100).optional(),
});

export type CreateJudgeInput = z.infer<typeof createJudgeSchema>;
export type UpdateJudgeInput = z.infer<typeof updateJudgeSchema>;