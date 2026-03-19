/*
 * @FilePath: \my-new-app\lib\log\logit.ts
 * @LastEditTime: 2026-03-19 17:18:55
 */
import crypto from "crypto";
import { db } from "@/lib/db";
import { axiomIngest } from "@/lib/axiom";

const NEON_MAX_JSON = 200_000;
const ERROR_COOLDOWN_MS = 5000;
let lastErrorTime = 0;

// ---------------------------------------------------------------------------
// Safe JSON helpers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// File + line extraction (robust, userland only)
// ---------------------------------------------------------------------------
function normalizeFilePath(file: string | null) {
  if (!file) return null;
  return file.replace(process.cwd(), "");
}

function extractCaller() {
  const stack = new Error().stack?.split("\n") ?? [];

  for (const line of stack) {
    const cleaned = line.trim();

    // Skip internal Node frames
    if (cleaned.includes("node:internal")) continue;

    // Skip node_modules
    if (cleaned.includes("node_modules")) continue;

    // Skip logger internals
    if (cleaned.includes("lib/log/logit")) continue;
    if (cleaned.includes("lib/log/logger")) continue;
    if (cleaned.includes("lib/log/build-universal-context")) continue;

    // Extract file + line
    const match =
      cleaned.match(/\((.*):(\d+):(\d+)\)/) ??
      cleaned.match(/at (.*):(\d+):(\d+)/);

    if (match) {
      return {
        file: normalizeFilePath(match[1]),
        line: match[2],
      };
    }
  }

  return { file: null, line: null };
}

// ---------------------------------------------------------------------------
// Main logit()
// ---------------------------------------------------------------------------
export async function logit(
  domain: string,
  event: Record<string, any>,
  payload: Record<string, any>,
  meta: Record<string, any>,
) {
  // --- Automatic file + line capture ----------------------------------------
  const { file: rawFile, line: rawLine } = extractCaller();

  const canonicalFile = payload.file ?? meta.file ?? rawFile ?? null;

  const canonicalLine = payload.line ?? meta.line ?? rawLine ?? null;

  // --- Request + eventIndex -------------------------------------------------
  const requestId = meta.requestId ?? crypto.randomUUID();
  const eventIndex = meta.eventIndex ?? 1;

  const originalMessage = (event.message ?? "").toString().trim();
  const message = originalMessage
    ? `#${eventIndex} ${originalMessage}`
    : `#${eventIndex} JMSG`;

  // --- Canonical user/session extraction -----------------------------------
  const canonicalUserId =
    payload.userId ?? payload.session?.user?.id ?? meta.built?.userId ?? null;

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

  // --- Flatten payload ------------------------------------------------------
  const flatPayload = {
    eventIndex,
    level: event.level ?? "info",
    message: originalMessage,
    ...payload,
    userId: canonicalUserId,
    sessionEmail: canonicalSessionEmail,
    sessionUser: canonicalSessionUser,
    file: canonicalFile,
    line: canonicalLine,
  };

  // --- Flatten meta ---------------------------------------------------------
  const flatMeta = {
    requestId,
    page: meta.page ?? null,
    built: meta.built ?? null,
    ...meta,
    userId: canonicalUserId,
    sessionEmail: canonicalSessionEmail,
    sessionUser: canonicalSessionUser,
    file: canonicalFile,
    line: canonicalLine,
  };

  // ---------------------------------------------------------------------------
  // Neon write
  // ---------------------------------------------------------------------------
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
        file: canonicalFile,
        line: canonicalLine,
      },
    });
  } catch (err) {
    const now = Date.now();
    if (now - lastErrorTime > ERROR_COOLDOWN_MS) {
      console.error("NEON LOG ERROR (suppressed after this)", err);
      lastErrorTime = now;
    }
  }

  // ---------------------------------------------------------------------------
  // Axiom ingestion
  // ---------------------------------------------------------------------------
  const axiomEvent = {
    domain,
    eventIndex,
    level: event.level ?? "info",
    message,
    file: canonicalFile,
    line: canonicalLine,
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
