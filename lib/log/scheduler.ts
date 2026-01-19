// lib/log/scheduler.ts
// Creation Date: 2026-01-19

import { flush } from "./flush";

let started = false;

export function startScheduler() {
  if (started) return;
  started = true;

  setInterval(() => {
    flush();
  }, 5000);
}
