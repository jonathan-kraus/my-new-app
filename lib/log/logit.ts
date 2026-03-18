import crypto from "crypto";
import { db } from "@/lib/db";
import { axiomIngest } from "@/lib/axiom";

const NEON_MAX_JSON = 200_000;
const ERROR_COOLDOWN_MS = 5000;
let lastErrorTime = 0;

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

function safeString(obj: any) {
  try {
    return JSON.stringify(obj ?? {});
  } catch {
    return "{}";
  }
}

export async function logit(
  domain: string,
  event: Record<string, any>,
  payload: Record<string, any>,
  meta: Record<string, any>,
) {
  // --- Core identifiers ----------------------------------------------------
  const requestId = meta.requestId ?? crypto.randomUUID();
  const eventIndex = meta.eventIndex ?? 1;

  const originalMessage = (event.message ?? "").toString().trim();
  const message = originalMessage
    ? `#${eventIndex} ${originalMessage}`
    : `#${eventIndex} JMSG`;

  // --- Flatten payload -----------------------------------------------------
  const flatPayload = {
    eventIndex,
    level: event.level ?? "info",
    message: originalMessage,
    ...payload,
  };

  // --- Flatten meta (remove meta.userId entirely) --------------------------
  const flatMeta = {
    requestId,
    page: meta.page ?? null,
    built: meta.built ?? null,
    ...meta,
    userId: undefined, // ensure meta.userId never pollutes logs
  };

  // --- Canonical userId (payload wins, then built) -------------------------
  const canonicalUserId =
    payload.userId ??
    meta.built?.userId ??
    null;

  // --- Neon ingestion ------------------------------------------------------
  try {
    await db.log.create({
      data: {
        domain,
        level: event.level ?? "info",
        message,
        requestId,
        payload: safeForNeon(flatPayload),
        meta: safeForNeon(flatMeta),
        page: flatMeta.page,
        userId: canonicalUserId, // <-- FIXED: always correct
      },
    });
  } catch (err) {
    const now = Date.now();
    if (now - lastErrorTime > ERROR_COOLDOWN_MS) {
      console.error("NEON LOG ERROR (suppressed after this)", err);
      lastErrorTime = now;
    }
  }

  // --- Axiom ingestion -----------------------------------------------------
  const axiomEvent = {
    domain,
    eventIndex,
    level: event.level ?? "info",
    message,
    meta_json: safeString(flatMeta),
    payload_json: safeString(flatPayload),
  };

  try {
    await axiomIngest([axiomEvent]);
  } catch (err) {
    console.error("AXIOM INGEST ERROR:", err);
  }

  return axiomEvent;
}
