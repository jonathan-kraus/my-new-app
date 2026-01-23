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

  const event = {
    domain,
    payload: {

      eventIndex,
    },
    meta: {
      
      requestId,
    },
    timestamp: new Date().toISOString(),
  };

  // Queue for Axiom (full fidelity)
  queueEvent(event);

  // Write to Neon (safe, truncated if needed)
  try {
    console.log("FINAL EVENT BEFORE WRITE", event);

    await db.log.create({
      data: {
        domain,
        level: payload.level ?? "info",
        message: payload.message ?? "",
        requestId,

        // Required by Prisma
        timestamp: BigInt(Date.now()),
        payload: safeForNeon(payload),
        meta: safeForNeon(event.meta), // ⭐ THIS LINE FIXES IT
        // Optional metadata
        page: meta.page ?? null,
        userId: meta.userId ?? null,
        sessionEmail: payload.sessionEmail ?? null,
        sessionUser: payload.sessionUser ?? null,
        file: payload.file ?? null,
        line: payload.line ?? null,
        data: safeForNeon(payload),
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
