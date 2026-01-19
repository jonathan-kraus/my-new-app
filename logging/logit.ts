import { enqueue } from "./queue";
import { flush } from "./flush";
import { scheduleFlush } from "./scheduler";
import type { LogitInput, InternalEvent } from "./types";

const MAX_BATCH_SIZE = 50;

function extractDomain(input: LogitInput) {
  const keys = ["ephemeris", "github", "weather", "notes"] as const;
  const found = keys.filter((k) => k in input);

  if (found.length !== 1) {
    throw new Error("logit() requires exactly one domain field");
  }

  const key = found[0];
  return { key, value: (input as any)[key] };
}

export function logit(input: LogitInput) {
  const { key, value } = extractDomain(input);

  const event: InternalEvent = {
    timestamp: Date.now(),
    level: input.level,
    message: input.message,
    [key]: value,
    meta: {
      env: process.env.NODE_ENV ?? "unknown",
      host: process.env.VERCEL_URL ?? "local",
    },
  };

  const newLength = enqueue(event);

  if (newLength >= MAX_BATCH_SIZE) {
    flush();
    return;
  }

  scheduleFlush();
}
