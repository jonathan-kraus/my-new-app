// lib/runtimeConfig.ts
import { db } from "@/lib/db";

export async function getRuntimeNumber(key: string, fallback: number) {
  const row = await db.runtimeConfig.findUnique({ where: { key } });
  return row ? Number(row.value) : fallback;
}

export async function getRuntimeString(key: string, fallback: string) {
  const row = await db.runtimeConfig.findUnique({ where: { key } });
  return row ? row.value : fallback;
}

export async function getRuntimeBoolean(key: string, fallback: boolean) {
  const row = await db.runtimeConfig.findUnique({ where: { key } });
  return row ? row.value === "1" : fallback;
}
