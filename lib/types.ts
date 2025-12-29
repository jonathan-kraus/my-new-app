// lib/types.ts - EXACT PRISMA MATCH
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface CreateLogInput {
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  userId?: string | null;
  page?: string | null;
  sessionId?: string | null;
  ipAddress?: string | null;
}
