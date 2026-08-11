import "server-only";
import { db } from "@/lib/db";
import { axiomIngest } from "@/lib/axiom";
import { z } from "zod";
import type { LogjInput, LogjPayload, LogjMeta } from "@/lib/log/types";

const NEON_MAX_JSON = 200_000;
const logCounters = new Map<string, number>();
// ---------------------------------------------------------------------------
// Zod schema for the *canonical* log record
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Safe JSON helpers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Main logj()
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Main logj() with hybrid callsite detection
// ---------------------------------------------------------------------------
export async function logj(input: LogjInput) {
  try {
    let {
      domain,
      level,
      message,
      file = null,
      line = null,
      payload = {},
      meta = {},
    } = input;

    // -----------------------------------------------------------------------
    // HYBRID CALLSITE DETECTION
    // Only fill file/line if user didn't provide them
    // -----------------------------------------------------------------------
    if (!file || !line) {
      const err = new Error();
      const stack = err.stack?.split("\n");
      const caller = stack?.find((frame) => !frame.includes("logj"));

      if (caller) {
        const match = caller.match(/\((.*):(\d+):\d+\)/);

        if (match) {
          const [_, rawFile, rawLine] = match;

          const detectedFile: string | null = rawFile ?? null;
          const detectedLine: number | null = rawLine ? Number(rawLine) : null;

          if (!file) file = detectedFile;
          if (!line) line = detectedLine;
        }
      }
    }

    // -----------------------------------------------------------------------
    // Canonical user/session/request fields
    // -----------------------------------------------------------------------
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

    // -----------------------------------------------------------------------
    // Canonical record
    // -----------------------------------------------------------------------
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

    // -----------------------------------------------------------------------
    // Event index prefix
    // -----------------------------------------------------------------------
    const eventIndex = (meta.built?.eventIndex ?? 0) as number;
    const prefixedMessage =
      eventIndex > 0 ? `#${eventIndex} ${message}` : message;

    // -----------------------------------------------------------------------
    // Write to Neon/Postgres
    // -----------------------------------------------------------------------
    await db.log.create({
      data: {
        ...record,
        message: prefixedMessage,
        payload: record.payload as any,
        meta: record.meta as any,
      },
    });

    // -----------------------------------------------------------------------
    // Write to Axiom
    // -----------------------------------------------------------------------
    await axiomIngest([
      {
        domain,
        level,
        message: prefixedMessage,
        file,
        line,
        eventIndex,
        meta_json: JSON.stringify(record.meta),
        payload_json: JSON.stringify(record.payload),
      },
    ]);
  } catch (err) {
    console.error("LOG ERROR:", err);
  }
}
