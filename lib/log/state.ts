// lib/log/state.ts

// requestId -> counter
const requestCounters = new WeakMap<object, number>();

// requestId strings aren't objects, so we wrap them
function keyFor(requestId: string) {
  return { id: requestId };
}

export function nextLogIndex(requestId: string | null) {
  if (!requestId) return null;

  const key = keyFor(requestId);
  const current = requestCounters.get(key) ?? 0;
  const next = current + 1;

  requestCounters.set(key, next);
  return next;
}
