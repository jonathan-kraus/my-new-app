// lib/serverLogger.ts
import { db } from './prisma';
import type { CreateLogInput } from './types';  // ✅ YOUR TYPE!

export async function logToDatabase(input: CreateLogInput): Promise<{ success: boolean }> {
  try {
    await db.log.create({
      data: {
        level: input.level,
        message: input.message,
        data: input.data || null,
        userId: input.userId,
        page: input.page,
        sessionId: input.sessionId,
        ipAddress: input.ipAddress,
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Database log failed:', error);
    return { success: false };
  }
}
