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

  // --- Canonical user/session fields ----------------------------------------
const canonicalUserId =
  payload.userId ??
  payload.session?.user?.id ??
  meta.built?.userId ??
  null;

const canonicalSessionEmail =
  payload.sessionEmail ??
  payload.session?.user?.email ??
  meta.built?.sessionEmail ??
  null;

const canonicalSessionUser =
  payload.sessionUser ??
  payload.session?.user?.name ??
  meta.built?.sessionUser ??
  null;

  // --- Flatten payload -----------------------------------------------------
 const flatPayload = {
  eventIndex,
  level: event.level ?? "info",
  message: originalMessage,
  ...payload,
  userId: canonicalUserId,
  sessionEmail: canonicalSessionEmail,
  sessionUser: canonicalSessionUser,
};

  // --- Flatten meta (remove meta.userId entirely) --------------------------
const flatMeta = {
  requestId,
  page: meta.page ?? null,
  built: meta.built ?? null,
  ...meta,
  userId: canonicalUserId,
  sessionEmail: canonicalSessionEmail,
  sessionUser: canonicalSessionUser,
};

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
    userId: canonicalUserId,
    sessionEmail: canonicalSessionEmail,
    sessionUser: canonicalSessionUser,
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
