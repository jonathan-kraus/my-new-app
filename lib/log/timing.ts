// lib/log/timing.ts

const requestStartTimes = new Map<string, number>();

export function markRequestStart(requestId: string | null) {
  console.log("TIMER STARTED FOR:", requestId);

  if (!requestId) return;
  requestStartTimes.set(requestId, Date.now());
}

export function getRequestDuration(requestId: string | null) {
  if (!requestId) return null;
  const start = requestStartTimes.get(requestId);
  if (!start) return null;
  return Date.now() - start;
}
