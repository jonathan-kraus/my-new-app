import { dequeueBatch } from "./queue";
import { flush } from "./flush";

let interval: NodeJS.Timeout | null = null;

export function startScheduler() {
  if (interval) return;

  interval = setInterval(async () => {
    const batch = dequeueBatch();
    if (batch.length === 0) return;

    await flush(batch);
  }, 2000);
}

export function stopScheduler() {
  if (!interval) return;
  clearInterval(interval);
  interval = null;
}

export function isSchedulerRunning() {
  return interval !== null;
}
