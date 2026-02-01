import crypto from "crypto";
import { enqueue } from "./queue";
import { nextLogIndex } from "./state";
import { db } from "@/lib/db";
import { startScheduler } from "./scheduler";
const ERROR_COOLDOWN_MS = 5000;
const NEON_MAX_JSON = 200_000;
let lastErrorTime = 0;


startScheduler();

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
  const requestId = meta.requestId ?? crypto.randomUUID();
  const eventIndex = nextLogIndex(requestId);
  const jmsg = "JMSG";
  const originalMessage = (payload.message ?? "").toString().trim();
  const message = originalMessage
    ? `#${eventIndex} ${originalMessage}`
    : `#${eventIndex} ${jmsg}`;

  const flatPayload = {
    eventIndex,
    ...(payload ?? {}),
    ...(meta?.payload ?? {}),
  };

  const flatMeta = {
    requestId,
    page: meta.page ?? null,
    userId: meta.userId ?? null,
  };

  const event = {
    domain,
    level: payload.level ?? "info",
    message,
    timestamp: new Date().toISOString(),
    payload: flatPayload,
    meta: flatMeta,
  };

  enqueue({
    domain,
    dataj: event,
  });

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
