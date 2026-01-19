import { flush } from "./flush";

const MAX_BATCH_AGE_MS = 5000;

let flushTimer: NodeJS.Timeout | null = null;

export function scheduleFlush() {
  if (flushTimer) return;

  flushTimer = setTimeout(async () => {
    flushTimer = null;
    await flush();
  }, MAX_BATCH_AGE_MS);
}

export function clearFlushTimer() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}
