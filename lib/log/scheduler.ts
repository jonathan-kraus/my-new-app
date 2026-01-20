// lib/log/scheduler.ts

import { dequeueBatch } from "./queue";
import { flush } from "./flush";

let started = false;

export function startScheduler() {
  if (started) return;
  started = true;

  setInterval(async () => {
    const batch = dequeueBatch();
    if (batch.length === 0) return;

    console.log("AXIOM FLUSH", batch.length);
    console.log("AXIOM FLUSHING", JSON.stringify(batch, null, 2));

    await flush(batch);
  }, 2000);
}
