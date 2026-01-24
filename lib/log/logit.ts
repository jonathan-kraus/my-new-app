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

  //
  // 1. Flatten the user payload
  //
  const flatPayload = {
    eventIndex,
    ...(payload?.payload ?? {}), // actual event data
  };

  //
  // 2. Flatten meta
  //
  const flatMeta = {
    requestId,
    page: meta.page ?? null,
    userId: meta.userId ?? null,
  };

  //
  // 3. Build the canonical event object
  //
  const event = {
    domain,
    level: payload.level ?? "info",
    message: payload.message ?? "",
    timestamp: new Date().toISOString(),
    payload: flatPayload,
    meta: flatMeta,
  };

  //
  // 4. Axiom: send ONE FIELD ONLY
  //
  queueEvent({
    domain,
    dataj: event,
  });

  //
  // 5. Neon: structured fields
  //
  try {
    await db.log.create({
      data: {
        domain,
        level: event.level,
        message: event.message,
        requestId,
        timestamp: BigInt(Date.now()),

        payload: safeForNeon(flatPayload),
        meta: safeForNeon(flatMeta),

        page: flatMeta.page,
        userId: flatMeta.userId,

        // Optional session fields
        sessionEmail: payload.sessionEmail ?? null,
        sessionUser: payload.sessionUser ?? null,
        file: payload.file ?? null,
        line: payload.line ?? null,

        // Legacy compatibility
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
