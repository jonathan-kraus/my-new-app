// lib/log/state.ts
// In-memory per-request log index counter

const counters = new Map<string, number>();

export function nextLogIndex(requestId: string) {
  const current = counters.get(requestId) ?? 0;
  const next = current + 1;
  counters.set(requestId, next);
  return next;
}
