// lib/log/index.ts

// Stores per-request log counters
const logIndexes = new Map<string, number>();

export function nextLogIndex(requestId: string | null) {
  if (!requestId) return null;

  const current = logIndexes.get(requestId) ?? 0;
  const next = current + 1;

  logIndexes.set(requestId, next);
  return next;
}

// Optional: prevent memory growth in long-lived environments
export function clearLogIndex(requestId: string | null) {
  if (!requestId) return;
  logIndexes.delete(requestId);
}
