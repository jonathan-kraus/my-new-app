"use server";

import { db8 } from "@/lib/db.prisma8";
import { staticUniversalContext } from "@/lib/log/buildj";
import { logj } from "@/lib/log/logj";
import { timestampString } from "@/lib/timestampString";
import { RuntimeAccessError, requireRuntimeAdmin } from "./admin";
import { deleteConfig, setConfig } from "./config";
import type { RuntimeActionResult } from "./validation";
import { runtimeKeySchema, runtimeSettingSchema } from "./validation";

const built = staticUniversalContext("runtime");
let jei = 0;
async function failure(error: unknown): Promise<RuntimeActionResult> {
  if (error instanceof RuntimeAccessError)
    return { ok: false, error: error.message };
  await logj({
    domain: "Jonathan",
    level: "error",
    message: "Runtime settings operation failed",
    file: "src/lib/runtime/actions.ts",
    line: 16,
    payload: { error },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
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
    await logj({
      domain: "Jonathan",
      level: "info",
      message: "Runtime settings succeeded",
      file: "src/lib/runtime/actions.ts",
      line: 37,
      payload: { error: false },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
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
