let queue: any[] = [];

export function enqueue(event: any) {
  queue.push(event);
}

export function dequeueBatch() {
  const batch = queue;
  queue = [];
  return batch;
}

export function peek() {
  return [...queue];
}

export function clear() {
  queue = [];
}
