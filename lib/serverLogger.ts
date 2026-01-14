import { db } from "./prisma";
import { Prisma } from "@prisma/client";
import type { CreateLogInput } from "./types";

export async function logToDatabase(
  input: CreateLogInput,
): Promise<{ success: boolean }> {
  try {
    const safeData =
      input.data !== undefined
        ? JSON.parse(JSON.stringify(input.data))
        : Prisma.JsonNull;

    await db.log.create({
      data: {
        level: input.level,
        message: input.message,
        data: safeData,
        userId: input.userId,
        page: input.page ?? "server logger",
        sessionUser: input.sessionUser ?? "Jonathan",
        sessionEmail: input.sessionEmail ?? null,
        durationMs: input.durationMs ?? null,
        eventIndex: input.eventIndex ?? null,
        requestId: input.requestId ?? null,
        file: input.file,
        line: input.line,
        createdAt: input.createdAt ?? new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Database log failed:", {
      error: error?.message,
      original: input,
    });
    return { success: false };
  }
}
