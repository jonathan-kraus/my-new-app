"use server";
// lib/log/logit.ts
// Creation Date: 2026-01-19

import { queueEvent } from "./queue";
import { startScheduler } from "./scheduler";
import type { InternalEvent, Domain, Meta } from "./types";

startScheduler(); // starts once per server instance

export async function logit(domain: Domain, payload: Record<string, any>, meta: Meta = {}) {
  const event: InternalEvent = {
    domain,
    payload,
    meta,
    timestamp: Date.now(),
  };

  queueEvent(event);
}
