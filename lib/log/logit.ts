// lib/log/logit.ts
import { CreateLogInput, LogitContext } from "./types";
import { queueEvent } from "./queueEvent";
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

export async function logit(
  domain: string,
  input: CreateLogInput,
  context: LogitContext = {},
) {
  const timestamp = new Date().toISOString();

  //
  // 1. Build the base event (this is what Axiom receives)
  //
  const event = {
    domain,
    level: input.level,
    message: input.message,
    payload: input.payload ?? {},
    meta: {
      requestId: context.requestId ?? input.meta?.requestId ?? null,
      userId: context.userId ?? input.meta?.userId ?? null,
      page: context.route ?? input.meta?.page ?? null,
      file: input.meta?.file ?? null,
      line: input.meta?.line ?? null,
    },
    timestamp,
  };

  // Extract early so it's in scope
const payload = event.payload;
const meta = event.meta;

// 2. Compute flat fields
const flatPayload: Record<string, any> = {
  ...payload,
  timestamp,
};

const flatMeta = {
  ...meta,
  eventIndex: nextLogIndex(domain),
};

// Update event BEFORE sending to Axiom
event.payload = flatPayload;
event.meta = flatMeta;

// 4. Axiom: send ONE FIELD ONLY
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
        requestId: flatMeta.requestId ?? null,
        payload: safeForNeon(flatPayload),
        meta: safeForNeon(flatMeta),

        page: flatMeta.page,
        userId: flatMeta.userId,

        // Optional session fields
        sessionEmail: flatPayload.sessionEmail ?? null,
        sessionUser: flatPayload.sessionUser ?? null,
        file: flatPayload.file ?? null,
        line: flatPayload.line ?? null,

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
