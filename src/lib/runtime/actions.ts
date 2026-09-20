"use server";

import { db8 } from "@/lib/db.prisma8";
import { timestampString } from "@/lib/timestampString";
import { deleteConfig, setConfig } from "./config";
import { requireRuntimeAdmin, RuntimeAccessError } from "./admin";
import { runtimeKeySchema, runtimeSettingSchema } from "./validation";
import type { RuntimeActionResult } from "./validation";

function failure(error: unknown): RuntimeActionResult {
  if (error instanceof RuntimeAccessError)
    return { ok: false, error: error.message };
  console.error("Runtime settings operation failed", error);
  return { ok: false, error: "Could not save the change. Please try again." };
}

export async function saveRuntimeSetting(
  input: unknown,
): Promise<RuntimeActionResult> {
  try {
    await requireRuntimeAdmin();
    const parsed = runtimeSettingSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]!.message };
    await setConfig(parsed.data.key, parsed.data.value);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function createRuntimeSetting(
  input: unknown,
): Promise<RuntimeActionResult> {
  try {
    await requireRuntimeAdmin();
    const parsed = runtimeSettingSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]!.message };
    const { key, value } = parsed.data;
    if (await db8.orm.public.RuntimeConfig.where({ key }).first()) {
      return {
        ok: false,
        error: "That setting already exists. Edit its existing row.",
      };
    }
    // Create rather than upsert so a concurrent addition cannot overwrite a setting.
    await db8.orm.public.RuntimeConfig.create({
      key,
      value,
      updatedAt: timestampString(new Date().toISOString()),
    });
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteRuntimeSetting(
  key: unknown,
): Promise<RuntimeActionResult> {
  try {
    await requireRuntimeAdmin();
    const parsed = runtimeKeySchema.safeParse(key);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]!.message };
    await deleteConfig(parsed.data);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
