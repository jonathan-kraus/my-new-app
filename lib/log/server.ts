/*
 * @FilePath: \my-new-app\lib\log\server.ts
 * @LastEditTime: 2026-09-04 01:30:48
 */
/*
 * Server-side logger
 * Writes to DB + Axiom
 */

import "server-only";
import { db } from "@/lib/db";
import { axiomIngest } from "@/lib/axiom";
import { z } from "zod";
import type { LogjInput } from "@/lib/log/types";

const NEON_MAX_JSON = 200_000;

// Canonical schema
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

// Safe JSON helpers
export function safeForNeon(value: unknown): unknown {
  try {
    if (
      value instanceof Request ||
      value instanceof Response ||
      value instanceof Headers ||
      value instanceof ReadableStream
    ) {
      return { unsupported: true, type: value.constructor.name };
    }

    if (typeof value === "object" && value !== null) {
      const plain: Record<string, unknown> = {};

      for (const [k, v] of Object.entries(value)) {
        if (
          v instanceof Request ||
          v instanceof Response ||
          v instanceof Headers ||
          v instanceof ReadableStream
        ) {
          plain[k] = { unsupported: true, type: v.constructor.name };
        } else {
          plain[k] = v;
        }
      }

      const json = JSON.stringify(plain);
      if (json.length > NEON_MAX_JSON) {
        return { truncated: true, originalSize: json.length };
      }

      return plain;
    }

    return value;
  } catch {
    return { truncated: true, error: "serialization_failed" };
  }
}

// Main server logger
export async function serverLog(input: LogjInput) {
  try {
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
      "canu") as string;

    const canonicalSessionEmail = (payload.sessionEmail ??
      payload.session?.user?.email ??
      meta.built?.sessionEmail ??
      "canse") as string;

    const canonicalSessionUser = (payload.sessionUser ??
      payload.session?.user?.name ??
      meta.built?.sessionUser ??
      "cansu") as string;

    const requestId = (payload.requestId ??
      meta.requestId ??
      meta.built?.requestId ??
      "canr") as string;

    const canonical: CanonicalLogRecord = {
      domain,
      level,
      message,
      file,
      line,
      requestId,
      userId: canonicalUserId,
      sessionEmail: canonicalSessionEmail,
      sessionUser: canonicalSessionUser,
      payload: safeForNeon(payload) as Record<string, unknown>,
      meta: safeForNeon(meta) as Record<string, unknown>,
    };

    const parsed = CanonicalLogRecordSchema.safeParse(canonical);
    if (!parsed.success) {
      console.error("Invalid log record", parsed.error.flatten());
      return;
    }

    const record = parsed.data;

    const eventIndex = (meta.built?.eventIndex ?? 0) as number;
    const prefixedMessage =
      eventIndex > 0 ? `#${eventIndex} ${message}` : message;

    await db.log.create({
      data: {
        ...record,
        message: prefixedMessage,
        payload: record.payload as any,
        meta: record.meta as any,
      },
    });

    await axiomIngest([
      {
        domain,
        level,
        message: prefixedMessage,
        file,
        line,
        eventIndex: meta.built?.eventIndex ?? 0,
        meta_json: JSON.stringify(record.meta),
        payload_json: JSON.stringify(record.payload),
      },
    ]);
  } catch (err) {
    console.error("LOG ERROR:", err);
  }
}
