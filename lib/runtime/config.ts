"use server";

import { db } from "@/lib/db";

export type RuntimeValue = string | number | boolean;

export async function getConfig(key: string, fallback?: RuntimeValue) {
  const row = await db.runtimeConfig.findUnique({ where: { key } });
  if (!row) return fallback;
  return parseValue(row.value);
}

export async function setConfig(key: string, value: RuntimeValue) {
  const stringValue = String(value);

  const row = await db.runtimeConfig.upsert({
    where: { key },
    update: { value: stringValue },
    create: { key, value: stringValue },
  });

  return parseValue(row.value);
}

export async function deleteConfig(key: string) {
  await db.runtimeConfig.delete({ where: { key } });
}

function parseValue(v: string): RuntimeValue {
  if (v === "true") return true;
  if (v === "false") return false;
  if (!isNaN(Number(v))) return Number(v);
  return v;
}
