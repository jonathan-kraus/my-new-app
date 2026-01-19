// lib/log/logit.ts
// Creation Date: 2026-01-18

import { queueEvent } from "./queue";
import type { LogitInput, InternalEvent } from "./types";

const DOMAIN_KEYS = [
  "github",
  "notes",
  "weather",
  "ephemeris",
  "jonathan",
] as const;

export function logit(input: LogitInput) {
  const timestamp = Date.now();

  // Find the domain key + payload
  const domainEntry = Object.entries(input).find(([key]) =>
    DOMAIN_KEYS.includes(key as any),
  );

  if (!domainEntry) {
    throw new Error("logit() called without a domain field");
  }

  const [domainKey, domainValue] = domainEntry as [string, Record<string, any>];

  // Enrich the domain payload with environment info
  const enrichedPayload = {
    ...domainValue,
    env: process.env.NODE_ENV ?? "unknown",
    host: process.env.VERCEL_URL ?? "local",
  };

  // Build the internal event
  const event: InternalEvent = {
    timestamp,
    level: input.level,
    message: input.message,
    domain: domainKey,
    payload: enrichedPayload,
    meta: input.meta,
  };

  // Push into queue
  queueEvent(event);
}
