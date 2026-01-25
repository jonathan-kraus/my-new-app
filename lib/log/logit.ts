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

  queueEvent({ domain, dataj: event });

  const requestId = event.meta.requestId ?? null;
  const payload = event.payload;
  const meta = event.meta;

  //
  // 1. Axiom: flat fields
  //
  const flatPayload = {
    ...payload,
    timestamp,
  };
  const flatMeta = {
    ...meta,
    eventIndex: nextLogIndex(domain),
  };

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
