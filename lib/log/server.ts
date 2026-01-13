// lib/log/server.ts
"use server";

import { log } from "next-axiom";
import { db } from "@/lib/db";
import { nextLogIndex } from "@/lib/log/state";
import { getCallerInfo } from "@/lib/log/caller";
import { getRequestDuration } from "@/lib/log/timing";
import type { CreateLogInput, LogLevel } from "@/lib/types";

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

export async function logit(input: CreateLogInput) {
  const {
    level = "info",
    message,
    file: manualFile = null,
    page = null,
    requestId = null,
    sessionEmail = null,
    userId = null,
    data = null,
    createdAt = new Date(),
  } = input;

  // Auto-detect caller
  const caller = getCallerInfo();
  const file = manualFile ?? caller.file;
  const line = caller.line;

  // Per-request log index
  const index = nextLogIndex(requestId);
  const prefix = index !== null ? `#${index}` : "";
  const finalMessage = prefix ? `${prefix} ${message}` : message;

  // Duration
  const durationMs = getRequestDuration(requestId);

  const payload = {
    level,
    message: finalMessage,
    file,
    line,
    page,
    requestId,
    sessionEmail,
    userId,
    durationMs,
    data,
    timestamp: createdAt.toISOString(),
  };
console.log("~~~AXIOM TEST&&&", finalMessage, payload);

  // 1. Axiom
  try {
    const ax = axiomFor(level);
    ax(finalMessage, payload);
  } catch {}

  // 2. Neon
  try {
    await db.log.create({
      data: {
        level,
        message: finalMessage,
        file,
        page,
        requestId,
        sessionEmail,
        userId,
        data: data as any,
        createdAt,
      },
    });
  } catch (err) {
    try {
      log.error("Failed to write log to Neon", {
        error: (err as Error).message,
        original: payload,
      });
    } catch {}
  }
}
