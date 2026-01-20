// lib/log/logit.ts
import { queueEvent } from "./queue";
import { nextLogIndex } from "./state";
import { startScheduler } from "./scheduler";

startScheduler();

export function logit(domain: string, payload: any, meta: any = {}) {
  const requestId = meta.requestId ?? crypto.randomUUID();
  const eventIndex = nextLogIndex(requestId);

  const event = {
    domain,
    payload: {
      ...payload,          // flatten payload
      eventIndex,
    },
    meta: {
      ...meta,
      requestId,
    },
    timestamp: new Date().toISOString(),   // ISO timestamp
  };

  queueEvent(event);
  return event;
}
