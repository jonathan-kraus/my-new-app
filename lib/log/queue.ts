import type { InternalEvent } from "./types";

let queue: InternalEvent[] = [];

export function queueEvent(event: InternalEvent) {
  queue.push(event);
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
