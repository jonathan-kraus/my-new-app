/*
 * @FilePath: \my-new-app\lib\log\logj.ts
 * @LastEditTime: 2026-03-23 01:20:42
 */

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
    if (cleaned.includes("lib/log/logj")) continue;
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
// Main logj()
// ---------------------------------------------------------------------------
export async function logj(
  domain: string,
  file: string | null,
  line: number | string | null,
  event: Record<string, any> = {},
  payload: Record<string, any> = {},
  meta: Record<string, any> = {},
) {
  try {
    // --- Normalizers --------------------------------------------------------
    const normalizeLine = (value: any) => {
      if (value == null) return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };

    const normalizeString = (value: any) => {
      if (value == null) return null;
      return typeof value === "string" ? value : String(value);
    };

    // --- Canonical fields ---------------------------------------------------
    const canonicalFile = normalizeString(file);
    const canonicalLine = normalizeLine(line);

const canonicalUserId =
  meta.userId ??
  meta.built?.userId ??
  payload.userId ??
  event.userId ??
  null;

const canonicalSessionEmail =
  meta.sessionEmail ??
  meta.built?.sessionEmail ??
  payload.sessionEmail ??
  event.sessionEmail ??
  null;

const canonicalSessionUser =
  meta.sessionUser ??
  meta.built?.sessionUser ??
  payload.sessionUser ??
  event.sessionUser ??
  null;

    // --- Flatten + sanitize -------------------------------------------------
    const flatPayload = safeForNeon(payload);
    const flatMeta = safeForNeon({
      ...meta,
      file: canonicalFile,
      line: canonicalLine,
    });

    // --- Message ------------------------------------------------------------
    const message =
      event.message ?? payload.message ?? meta.message ?? "(no message)";

    const requestId =
      meta.requestId ?? payload.requestId ?? event.requestId ?? null;

    // --- Write to Neon ------------------------------------------------------
    await db.log.create({
      data: {
        domain,
        level: event.level ?? "info",
        message,
        requestId,
        payload: flatPayload,
        meta: flatMeta,
        page: flatMeta.page ?? null,
        userId: canonicalUserId,
        sessionEmail: canonicalSessionEmail,
        sessionUser: canonicalSessionUser,
        file: canonicalFile,
        line: canonicalLine,
      },
    });

    // --- Axiom ingestion (INSIDE function!) --------------------------------
    const axiomEvent = {
      domain,
      eventIndex: event.eventIndex ?? 0,
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
  } catch (err) {
    const now = Date.now();
    if (now - lastErrorTime > ERROR_COOLDOWN_MS) {
      console.error("NEON LOG ERROR (suppressed after this)", err);
      lastErrorTime = now;
    }
  }
}
