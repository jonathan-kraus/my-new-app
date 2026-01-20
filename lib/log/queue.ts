// lib/log/queue.ts
// Creation Date: 2026-01-19

import type { InternalEvent } from "./types";

let queue: InternalEvent[] = [];

export function queueEvent(event: InternalEvent) {
  queue.push(event);
  console.log("AXIOM QUEUE PUSH", event);

  return queue.length;
}

export function snapshotAndClear(): InternalEvent[] {
  const snapshot = queue;
  queue = [];
  return snapshot;
}

export function getLength() {
  return queue.length;
}
