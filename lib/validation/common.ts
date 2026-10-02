import { z } from "zod";

/**
 * Normalises optional text so a blank string from a form is treated as an
 * omitted field instead of an empty string.
 */
export const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional()
);