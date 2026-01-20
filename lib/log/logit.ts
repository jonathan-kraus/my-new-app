// lib/log/logit.ts
import { queueEvent } from "./queue";
import { nextLogIndex } from "./state";
import { startScheduler } from "./scheduler";
import { db } from "@/lib/db"; // Neon (Prisma)
import { client } from "@/lib/axiom"; // Axiom

startScheduler();

// Cooldown to prevent log spam if Neon/Axiom fail
let lastErrorTime = 0;
const ERROR_COOLDOWN_MS = 5000;

export async function logit(domain: string, payload: any, meta: any = {}) {
  const requestId = meta.requestId ?? crypto.randomUUID();
  const eventIndex = nextLogIndex(requestId);

  const event = {
    domain,
    payload: {
      ...payload,
      eventIndex,
    },
    meta: {
      ...meta,
      requestId,
    },
    timestamp: new Date().toISOString(),
  };

  // Queue for Axiom (batching)
  queueEvent(event);

  // Write to Neon immediately (no batching)
  try {
await db.log.create({
  data: {
    domain,
    level: payload.level ?? "info",
    message: payload.message ?? "",
    requestId,

    // required by Prisma
    timestamp: BigInt(Date.now()),
    payload: payload ?? {},

    // optional metadata
    page: meta.page ?? null,
    userId: meta.userId ?? null,
    sessionEmail: payload.sessionEmail ?? null,
    sessionUser: payload.sessionUser ?? null,
    file: payload.file ?? null,
    line: payload.line ?? null,
    data: payload ?? null,
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
