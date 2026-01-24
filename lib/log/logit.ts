// lib/log/logit.ts
import { queueEvent } from "./queue";
import { nextLogIndex } from "./state";
import { startScheduler } from "./scheduler";
import { db } from "@/lib/db"; // Neon (Prisma)


startScheduler();

// Cooldown to prevent log spam if Neon/Axiom fail
let lastErrorTime = 0;
const ERROR_COOLDOWN_MS = 5000;

// Max size Neon can safely handle (200 KB JSON)
const NEON_MAX_JSON = 200_000;

function safeForNeon(obj: any) {
  try {
    const json = JSON.stringify(obj);
    if (json.length > NEON_MAX_JSON) {
      return {
        truncated: true,
        originalSize: json.length,
      };
    }
    return obj;
  } catch {
    return { truncated: true, error: "serialization_failed" };
  }
}

export async function logit(domain: string, payload: any, meta: any = {}) {
  const requestId = meta.requestId ?? crypto.randomUUID();
  const eventIndex = nextLogIndex(requestId);

  // The canonical event object for your app
  const event = {
    domain,
    level: payload.level ?? "info",
    message: payload.message ?? "",
    timestamp: new Date().toISOString(),

    payload: {
      ...payload,
      eventIndex,
    },

    meta: {
      requestId,
      page: meta.page ?? null,
      userId: meta.userId ?? null,
    },
  };

  // ⭐ Axiom receives ONE FIELD: dataj
  queueEvent({
    domain,
    dataj: event,   // ← everything wrapped here
  });

  // Neon still gets structured fields
  try {
    await db.log.create({
      data: {
        domain,
        level: event.level,
        message: event.message,
        requestId,
        timestamp: BigInt(Date.now()),

        payload: safeForNeon(event.payload),
        meta: safeForNeon(event.meta),

        page: event.meta.page,
        userId: event.meta.userId,

        // Optional session fields
        sessionEmail: payload.sessionEmail ?? null,
        sessionUser: payload.sessionUser ?? null,
        file: payload.file ?? null,
        line: payload.line ?? null,

        // Legacy compatibility
        data: safeForNeon(event.payload),
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
