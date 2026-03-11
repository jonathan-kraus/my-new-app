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

  // --- Internal structures (your new format) -------------------------------
  const flatPayload = {
    eventIndex,
    level: event.level ?? "info",
    message: originalMessage,
    payload,
  };

  const flatMeta = {
    requestId,
    page: meta.page ?? null,
    userId: meta.userId ?? null,

    // any additional fields you want are safe here
    ...meta,
  };

  // --- DB write (unchanged) ------------------------------------------------
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
        userId: flatMeta.userId,
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

  // --- Axiom ingestion (schema‑compatible) --------------------------------
  const axiomEvent = {
    domain,
    eventIndex,
    level: event.level ?? "info",
    message,

    // These two fields are ALWAYS allowed because they are strings
    meta_json: safeString(flatMeta),
    payload_json: safeString(flatPayload),

    // You may add ANY additional fields here *if they already exist in your schema*
    // or if you want to expand your schema intentionally.
    // Example:
    // jzulu: new Date().toISOString()
  };

  try {
    await axiomIngest(process.env.AXIOM_DATASET!, [axiomEvent]);
  } catch (err) {
    console.error("AXIOM INGEST ERROR:", err);
  }

  return axiomEvent;
}
