"use server";
// lib/log/logit.ts
// Creation Date: 2026-01-19

import { queueEvent } from "./queue";
import { startScheduler } from "./scheduler";
import { logToDatabase } from "@/lib/serverLogger";
import { nextLogIndex } from "./state"; // your in-memory counter
import type { InternalEvent, Domain, Meta } from "./types";

startScheduler(); // starts once per server instance

// Error suppression map
const lastErrorByMessage = new Map<string, number>();
const ERROR_COOLDOWN = 10_000; // 10 seconds

export async function logit(
  domain: Domain,
  payload: Record<string, any>,
  meta: Meta = {},
) {
  // --- 1. Error rate limiting ----------------------------------------------
  if (payload.level === "error") {
    const key = payload.message;
    const now = Date.now();
    const last = lastErrorByMessage.get(key) ?? 0;

    if (now - last < ERROR_COOLDOWN) {
      return; // skip duplicate error
    }

    lastErrorByMessage.set(key, now);
  }

  // --- 2. Per-request sequencing (#1, #2, #3) -------------------------------
  let message = payload.message;
  const requestId = meta.requestId ?? null;

  if (requestId) {
    const index = nextLogIndex(requestId);
    message = `#${index} ${message}`;
  }

  // --- 3. Build event -------------------------------------------------------
  const event: InternalEvent = {
    domain,
    payload: { ...payload, message },
    meta,
    timestamp: Date.now(),
  };

  // --- 4. Axiom ingestion ---------------------------------------------------
  queueEvent(event);

  // --- 5. Neon ingestion ----------------------------------------------------
  try {
    await logToDatabase({
      level: payload.level ?? "info",
      message,
      domain,
      payload,
      meta,
    });
  } catch (err) {
    console.error("Neon ingestion failed", err);
  }
}
