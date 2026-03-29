import { db } from "@/lib/db";
import { axiomIngest } from "@/lib/axiom";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const NEON_MAX_JSON = 200_000;

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
type LogjPayload = Record<string, unknown> & {
  userId?: string;
  sessionEmail?: string;
  sessionUser?: string;
  requestId?: string;
  session?: {
    user?: {
      id?: string;
      email?: string;
      name?: string;
    };
  };
};

type LogjMeta = Record<string, unknown> & {
  requestId?: string | null;
  built?: Record<string, unknown>;
};

export type LogjInput = {
  domain: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  file?: string | null;
  line?: number | null;
  payload?: LogjPayload;
  meta?: LogjMeta;
};

// ---------------------------------------------------------------------------
// Safe JSON helpers
// ---------------------------------------------------------------------------
function safeForNeon(obj: any) {
  try {
    const json = JSON.stringify(obj);
    if (json.length > NEON_MAX_JSON) {
      return { truncated: true, originalSize: json.length };
    }
    if (obj === undefined) return null;
    return obj;
  } catch {
    return { truncated: true, error: "serialization_failed" };
  }
}

// ---------------------------------------------------------------------------
// Main logj()
// ---------------------------------------------------------------------------
export async function logj(input: LogjInput) {
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

    // --- Canonical user/session extraction -----------------------------------
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

    // --- Build canonical record ----------------------------------------------
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
      payload: safeForNeon(payload) as Prisma.InputJsonValue,
      meta: safeForNeon(meta) as Prisma.InputJsonValue,
    };

    // --- Validate canonical record -------------------------------------------
    const parsed = CanonicalLogRecordSchema.safeParse(canonical);
    if (!parsed.success) {
      console.error("Invalid log record", parsed.error.flatten());
      return;
    }

    const record = parsed.data;

    // --- Write to Neon -------------------------------------------------------
    await db.log.create({
      data: {
        ...record,
      payload: record.payload as Prisma.JsonValue,
      meta: record.meta as Prisma.JsonValue,
      },
    });

    // --- Axiom ingestion -----------------------------------------------------
    await axiomIngest([
      {
        domain,
        level,
        message,
        eventIndex: meta.eventIndex ?? 0,
        meta_json: JSON.stringify(record.meta),
        payload_json: JSON.stringify(record.payload),
      },
    ]);
  } catch (err) {
    console.error("LOG ERROR:", err);
  }
}
