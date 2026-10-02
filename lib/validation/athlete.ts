import { z } from "zod";
import { Gender } from "@/lib/types";

export const genderSchema = z.enum(["PUTRA", "PUTRI"] satisfies readonly Gender[]);

export const createAthleteSchema = z.object({
  name: z.string().min(1),
  contingent: z.string().min(1),
  contingentCode: z.string().optional(),
  gender: genderSchema,
  weightClass: z.string().min(1),
});

export const updateAthleteSchema = createAthleteSchema;

export type CreateAthleteInput = z.infer<typeof createAthleteSchema>;
export type UpdateAthleteInput = z.infer<typeof updateAthleteSchema>;