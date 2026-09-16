/*
 * @FilePath: \my-new-app\src\lib\log\server.ts
 * @LastEditTime: 2026-09-16 17:48:15
 */
/*
 * Server-side logger
 * Writes independently to DB + Axiom
 */

import { db } from "@/lib/db";
import { axiomIngest } from "@/lib/axiom";
import { z } from "zod";
import type { LogjInput } from "@/lib/log/types";

const NEON_MAX_JSON = 200_000;

// --------------------------------------------------
// Canonical schema
// --------------------------------------------------

export const CanonicalLogRecordSchema = z.object({
  domain: z.string().min(1),
  level: z.enum(["info", "warn", "error", "debug"]),
  message: z.string().min(1),

  file: z.string().nullable(),
  line: z.number().int().nullable(),

  requestId: z.string().nullable().optional(),
  userId: z.string().nullable(),
  sessionEmail: z.string().nullable(),
  sessionUser: z.string().nullable(),

  payload: z.record(z.string(), z.unknown()),
  meta: z.record(z.string(), z.unknown()),
});

export type CanonicalLogRecord = z.infer<typeof CanonicalLogRecordSchema>;

// --------------------------------------------------
// Safe JSON helper
// --------------------------------------------------

export function safeForNeon(value: unknown): unknown {
  try {
    if (
      value instanceof Request ||
      value instanceof Response ||
      value instanceof Headers ||
      value instanceof ReadableStream
    ) {
      return {
        unsupported: true,
        type: value.constructor.name,
      };
    }

    if (typeof value === "object" && value !== null) {
      const plain: Record<string, unknown> = {};

      for (const [key, item] of Object.entries(value)) {
        if (
          item instanceof Request ||
          item instanceof Response ||
          item instanceof Headers ||
          item instanceof ReadableStream
        ) {
          plain[key] = {
            unsupported: true,
            type: item.constructor.name,
          };
        } else {
          plain[key] = item;
        }
      }

      const json = JSON.stringify(plain);

      if (json.length > NEON_MAX_JSON) {
        return {
          truncated: true,
          originalSize: json.length,
        };
      }

      return plain;
    }

    return value;
  } catch {
    return {
      truncated: true,
      error: "serialization_failed",
    };
  }
}

// --------------------------------------------------
// Main server logger
// --------------------------------------------------

export async function serverLog(input: LogjInput) {
  const {
    domain,
    level,
    message,
    file = null,
    line = null,
    payload = {},
    meta = {},
  } = input;

  const canonicalUserId = (payload.userId ??
    payload.session?.user?.id ??
    meta.built?.userId ??
    null) as string | null;

  const canonicalSessionEmail = (payload.sessionEmail ??
    payload.session?.user?.email ??
    meta.built?.sessionEmail ??
    null) as string | null;

  const canonicalSessionUser = (payload.sessionUser ??
    payload.session?.user?.name ??
    meta.built?.sessionUser ??
    null) as string | null;

  const requestId = (payload.requestId ??
    meta.requestId ??
    meta.built?.requestId ??
    null) as string | null;

  const eventIndex = Number(meta.built?.eventIndex ?? 0);

  const prefixedMessage =
    eventIndex > 0 ? `#${eventIndex} ${message}` : message;

  const canonical: CanonicalLogRecord = {
    domain,
    level,
    message: prefixedMessage,
    file,
    line,
    requestId,
    userId: canonicalUserId,
    sessionEmail: canonicalSessionEmail,
    sessionUser: canonicalSessionUser,
    payload: safeForNeon(payload) as Record<string, unknown>,
    meta: safeForNeon(meta) as Record<string, unknown>,
  };

  // --------------------------------------------------
  // Validate once before sending anywhere
  // --------------------------------------------------

  const parsed = CanonicalLogRecordSchema.safeParse(canonical);

  if (!parsed.success) {
    console.error("Invalid log record", parsed.error.flatten());
    return;
  }

  const record = parsed.data;

  // --------------------------------------------------
  // Neon
  // --------------------------------------------------

  try {
    await db.log.create({
      data: {
        ...record,
        payload: record.payload as any,
        meta: record.meta as any,
      },
    });
  } catch (err) {
    console.error("NEON LOG ERROR:", err);
  }

  // --------------------------------------------------
  // Axiom
  //
  // Keep useful fields directly queryable.
  // Do not make Axiom dependent on the Neon write.
  // --------------------------------------------------

  try {
    await axiomIngest([
      {
        domain: record.domain,
        level: record.level,
        message: record.message,

        file: record.file,
        line: record.line,

        requestId: record.requestId ?? null,
        userId: record.userId,
        sessionEmail: record.sessionEmail,
        sessionUser: record.sessionUser,

        eventIndex,

        payload: record.payload,
        meta: record.meta,
      },
    ]);
  } catch (err) {
    console.error("AXIOM LOG ERROR:", err);
  }
}
