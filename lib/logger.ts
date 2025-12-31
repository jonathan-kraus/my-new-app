// lib/logger.ts - TYPES ONLY (no DB!)
export interface LogMessage {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: Record<string, any>;
  userId?: string;
  page?: string;
}

// ✅ Universal - works Client/Server/Mars
export async function appLog(msg: Omit<LogMessage, "createdAt">): Promise<{ success: boolean }> {
  const payload = { ...msg, createdAt: new Date().toISOString() };

  try {
    const response = await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(`[LOG-${result.success ? 'OK' : 'FAIL'}] ${msg.message}`);
    return result;
  } catch (error) {
    console.error('[LOG-ERROR]', error);
    return { success: false };
  }
}
