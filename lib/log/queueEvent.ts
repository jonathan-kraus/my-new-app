// lib/log/queueEvent.ts

type QueueEventInput = {
  domain: string;
  dataj: Record<string, any>;
};

const queue: QueueEventInput[] = [];

export function queueEvent(event: QueueEventInput) {
  queue.push(event);
}

export function flushQueue() {
  const events = queue.splice(0, queue.length);

  // Your existing Axiom ingestion logic goes here.
  // Example:
  // await axiom.ingest("logs", events);

  return events;
}
