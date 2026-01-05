import { db } from "@/lib/db";

export async function getRuntimeNumber(
  key: string,
  fallback: number,
): Promise<number> {
  const row = await db.runtimeConfig.findUnique({ where: { key } });
  if (!row) return fallback;

  const parsed = Number(row.value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
