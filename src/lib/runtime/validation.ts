import { z } from "zod";

export const runtimeKeySchema = z
  .string()
  .trim()
  .min(1, "Enter a setting key.")
  .max(200, "Setting keys must be at most 200 characters.")
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/,
    "Use letters, numbers, dots, underscores, or hyphens in the key.",
  );

export const runtimeSettingSchema = z.object({
  key: runtimeKeySchema,
  value: z
    .string()
    .max(10_000, "Values must be at most 10,000 characters.")
    .refine((value) => value.trim().length > 0, "Enter a value."),
});

export type RuntimeSetting = z.infer<typeof runtimeSettingSchema>;
export type RuntimeActionResult = { ok: true } | { ok: false; error: string };
