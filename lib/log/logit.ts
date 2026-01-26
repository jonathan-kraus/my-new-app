// lib/log/logit.ts
import crypto from "crypto";
import { queueEvent } from "./queue";
import { nextLogIndex } from "./state";
import { startScheduler } from "./scheduler";
import { db } from "@/lib/db";

startScheduler();

let lastErrorTime = 0;
const ERROR_COOLDOWN_MS = 5000;
const NEON_MAX_JSON = 200_000;

function safeForNeon(obj: any) {
  try {
    const json = JSON.stringify(obj);
    if (json.length > NEON_MAX_JSON) {
      return { truncated: true, originalSize: json.length };
    }
    return obj;
  } catch {
    return { truncated: true, error: "serialization_failed" };
  }
}

export async function logit(domain: string, payload: any, meta: any = {}) {
  //
  // 1. Determine requestId and eventIndex
  //
  const requestId = meta.requestId ?? crypto.randomUUID();

  // Per-request sequencing (the behavior you want)
  const eventIndex = nextLogIndex(requestId);

  // Human-friendly numbering (#1, #2, #3…)
  //const humanIndex = eventIndex + 1;
  const originalMessage = payload.message ?? "";
  const message = `#${eventIndex} ${originalMessage}`;

  //
  // 2. Flatten payload and meta
  //
  const flatPayload = {
    eventIndex,
    ...(payload?.payload ?? {}),
  };

  const flatMeta = {
    requestId,
    page: meta.page ?? null,
    userId: meta.userId ?? null,
  };

  //
  // 3. Build canonical event (Axiom receives this)
  //
  const event = {
    domain,
    level: payload.level ?? "info",
    message,
    timestamp: new Date().toISOString(),
    payload: flatPayload,
    meta: flatMeta,
  };

  //
  // 4. Queue for Axiom ingestion
  //
  queueEvent({
    domain,
    dataj: event,
  });

  //
  // 5. Neon structured write
  //
  try {
    await db.log.create({
      data: {
        domain,
        level: event.level,
        message: event.message,
        requestId,
        payload: safeForNeon(flatPayload),
        meta: safeForNeon(flatMeta),

        page: flatMeta.page,
        userId: flatMeta.userId,

        sessionEmail: payload.sessionEmail ?? null,
        sessionUser: payload.sessionUser ?? null,
        file: payload.file ?? null,
        line: payload.line ?? null,

        data: safeForNeon(flatPayload),
      },
    });
  } catch (err) {
    const now = Date.now();
    if (now - lastErrorTime > ERROR_COOLDOWN_MS) {
      console.error("NEON LOG ERROR (suppressed after this)", err);
      lastErrorTime = now;
    }
  }

  return event;
}
