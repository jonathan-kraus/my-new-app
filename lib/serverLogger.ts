// lib/serverLogger.ts
import { db } from "./prisma";
import { Prisma } from "@prisma/client";
import type { CreateLogInput } from "./types"; // ✅ YOUR TYPE!

export async function logToDatabase(
  input: CreateLogInput,
): Promise<{ success: boolean }> {
  try {
    await db.log.create({
      data: {
        level: input.level,
        message: input.message,
        data: input.data
          ? (input.data as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        userId: input.userId,
        page: input.page,
        sessionUser: "Jonathan"
        //sessionId: input.sessionId,
        file: input.file,
        line: input.line,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Database log failed:", error);
    return { success: false };
  }
}
