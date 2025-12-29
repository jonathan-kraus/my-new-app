// lib/serverLogger.ts - Server components
import { appLog, LogMessage } from './logger';

export async function logServer(level: LogMessage['level'], message: string, data?: any, userId?: string) {
  return appLog({ level, message, data, userId });
}
