// lib/log/timing.ts

export function getRequestDuration(requestId: string) {
  if (!requestId) return null;
  const start = requestStartTimes.get(requestId);
  if (!start) return null;
  return Date.now() - start;
}
const requestStartTimes = new Map<string, number>();

export function markRequestStart(requestId: string) {
  requestStartTimes.set(requestId, Date.now());
}

export function markRequestEnd(requestId: string) {
  const start = requestStartTimes.get(requestId);
  if (!start) return null;

  const duration = Date.now() - start;
  requestStartTimes.delete(requestId);
  return duration;
}
