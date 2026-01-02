// lib/types.ts - EXACT PRISMA MATCH
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface CreateLogInput {
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  page?: string | null;
  userId?: string | null;
  sessionEmail?: string | null;
  sessionUser?: string | null;
  requestId?: string | null;
  file?: string | null;
  line?: number | null;
  createdAt?: Date;
}

