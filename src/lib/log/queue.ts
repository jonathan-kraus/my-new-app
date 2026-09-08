// lib/log/queue.ts

export type QueueEvent = {
  domain: string;
  dataj: Record<string, any>;
};

let queue: QueueEvent[] = [];

// Add an event to the queue and return new length
export function enqueue(event: QueueEvent): number {
  queue.push(event);
  return queue.length;
}

// Atomically snapshot and clear the queue
export function dequeueBatch(): QueueEvent[] {
  const snapshot = queue;
  queue = [];
  return snapshot;
}

// Read-only view of current queue
export function peek(): QueueEvent[] {
  return [...queue];
}

// Hard reset
export function clear(): void {
  queue = [];
}

// Optional test helpers
export const _getQueue = () => queue;
export const _clearQueue = () => (queue = []);
