// lib/log/queue.ts

let queue: any[] = [];

export function queueEvent(event: any) {
  queue.push(event);
}

export function dequeueBatch() {
  const batch = queue;
  queue = [];
  return batch;
}

export function getLength() {
  return queue.length;
}
