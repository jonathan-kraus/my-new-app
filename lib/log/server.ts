// lib/log/server.ts
"use server";

import { log } from "next-axiom";
import { db } from "@/lib/db";
import { nextLogIndex } from "@/lib/log/index";
import type { LogLevel } from "@/lib/types";

function axiomFor(level: LogLevel) {
  switch (level) {
    case "debug":
      return log.debug.bind(log);
    case "info":
      return log.info.bind(log);
    case "warn":
      return log.warn.bind(log);
    case "error":
      return log.error.bind(log);
    default:
      return log.info.bind(log);
  }
}

export async function logit(entry: {
  level: string;
  message: string;
  page?: string | null;
  file?: string | null;
  line?: number | null;
  requestId?: string | null;
  sessionEmail?: string | null;
  userId?: string | null;
  durationMs?: number | null;
  eventIndex?: number | null;
  data?: any;
}) {
  try {
    // Generate per-request log index prefix (#1, #2, #3…)
    const index = entry.requestId ? nextLogIndex(entry.requestId) : null;
    const prefix = index !== null ? `#${index}` : "";
    const finalMessage = prefix ? `${prefix} ${entry.message}` : entry.message;
  // 1. Axiom

  try {
    const level="info"
    const ax = axiomFor(level);
    ax(finalMessage, entry);
  } catch {}

    await db.log.create({
      data: {
        level: entry.level,
        message: finalMessage,
        page: entry.page ?? null,
        file: entry.file ?? null,
        line: entry.line ?? null,
        requestId: entry.requestId ?? null,
        sessionEmail: entry.sessionEmail ?? null,
        userId: entry.userId ?? null,

        // ⭐ These two fields MUST be forwarded or they will always be null
        durationMs: entry.durationMs ?? null,
        eventIndex: entry.eventIndex ?? null,

        data: entry.data ?? null,
      },
    });
  } catch (err) {
    console.error("LOGGING ERROR:", err);
  }
}



