import crypto from "crypto";
import { db } from "@/lib/db";
import { getAxiomClient } from "@/lib/axiom";

const NEON_MAX_JSON = 200_000;
const ERROR_COOLDOWN_MS = 5000;
let lastErrorTime = 0;

// --- Helpers ---------------------------------------------------------------

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

function safeForAxiom(obj: any) {
  try {
    return JSON.stringify(obj ?? {});
  } catch {
    return "{}";
  }
}

// --- FINAL DIRECT‑INGEST LOGIT --------------------------------------------

export async function logit(
  domain: string,
  event: Record<string, any>,
  payload: Record<string, any>,
  meta: Record<string, any>
) {
  // --- Identity ------------------------------------------------------------
  const requestId = meta.requestId ?? crypto.randomUUID();
  const eventIndex = meta.eventIndex ?? 1;

  // --- Message -------------------------------------------------------------
  const originalMessage = (event.message ?? "").toString().trim();
  const message = originalMessage
    ? `#${eventIndex} ${originalMessage}`
    : `#${eventIndex} JMSG`;

  // --- Flatten payload -----------------------------------------------------
  const flatPayload = {
    ...(payload ?? {}),
    ...(meta?.payload ?? {}),
    eventIndex,
  };

  // --- Flatten meta --------------------------------------------------------
  const flatMeta = {
    requestId,
    page: meta.page ?? null,
    userId: meta.userId ?? null,
    zulu: meta.zulu,
    local: meta.local,
  };

  const timestamp = new Date().toISOString();

  // --- Structured event for DB --------------------------------------------
  const eventRecord = {
    domain,
    level: event.level ?? "info",
    message,
    timestamp,
    payload: flatPayload,
    meta: flatMeta,
  };

  // --- Structured event for Axiom -----------------------------------------
  const axiomEvent = {
    domain,
    level: eventRecord.level,
    message: eventRecord.message,
    timestamp,
    payload_json: safeForAxiom(flatPayload),
    meta_json: safeForAxiom(flatMeta),
    requestId,
    eventIndex,
    page: flatMeta.page,
    userId: flatMeta.userId,
  };

  // --- Neon ingestion ------------------------------------------------------
  try {
    await db.log.create({
      data: {
        domain,
        level: eventRecord.level,
        message: eventRecord.message,
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

  // --- Axiom ingestion (direct) -------------------------------------------
  try {
    const client = getAxiomClient();
        console.log("Axiom event:", axiomEvent);
    client.ingest(process.env.AXIOM_DATASET!, [axiomEvent]); // <-- IMPORTANT: array
  } catch (err) {
    console.error("Axiom log ingestion failed:", err);
  }

  return eventRecord;
}
