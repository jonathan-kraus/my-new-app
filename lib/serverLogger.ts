// lib/serverLogger.ts
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { CreateLogInput } from "./types";

export async function logToDatabase(
  input: CreateLogInput,
): Promise<{ success: boolean }> {
  try {

await db.log.create({
  data: {
    timestamp: BigInt(Date.now()),
    level: input.level,
    message: input.message,
    domain: input.domain,
    payload: input.payload ?? {},
    meta: input.meta ?? Prisma.JsonNull,
    env: process.env.NODE_ENV,
    host: process.env.VERCEL_URL ?? "local",
  },
});


    return { success: true };
  } catch (error) {
    console.error("Database log failed:", {
      error: error,
      original: input,
    });
    return { success: false };
  }
}
