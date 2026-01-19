"use server";
// lib/log/logit.ts
// Creation Date: 2026-01-19

import { queueEvent } from "./queue";
import { startScheduler } from "./scheduler";
import { logToDatabase } from "@/lib/serverLogger";
import type { InternalEvent, Domain, Meta } from "./types";

startScheduler(); // starts once per server instance

export async function logit(
  domain: Domain,
  payload: Record<string, any>,
  meta: Meta = {},
) {
  const event: InternalEvent = {
    domain,
    payload,
    meta,
    timestamp: Date.now(),
  };

  // 1. Axiom ingestion
  queueEvent(event);

  // 2. Neon ingestion
  try {
    await logToDatabase({
      level: payload.level ?? "info",
      message: payload.message ?? "",
      domain,
      payload,
      meta,
    });
  } catch (err) {
    console.error("Neon ingestion failed", err);
  }
}
