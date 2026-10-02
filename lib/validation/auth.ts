import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("email tidak valid."),
  password: z.string().min(8, "kata sandi minimal 8 karakter."),
});

export type LoginInput = z.infer<typeof loginSchema>;