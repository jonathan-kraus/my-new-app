// lib/log/server.ts
"use server";

import { log } from "next-axiom";
import { db } from "@/lib/db";
import type { CreateLogInput, LogLevel } from "@/lib/types";
import { nextLogIndex } from "@/lib/log/state";

function axiomFor(level: LogLevel) {
  switch (level) {
    case "debug": return log.debug.bind(log);
    case "info":  return log.info.bind(log);
    case "warn":  return log.warn.bind(log);
    case "error": return log.error.bind(log);
    default:      return log.info.bind(log);
  }
}

export async function logit(input: CreateLogInput) {
  const {
    level = "info",
    message,
    file = null,
    page = null,
    requestId = null,
    sessionEmail = null,
    userId = null,
    data = null,
    createdAt = new Date(),
  } = input;

  // Per-request log index
  const index = nextLogIndex(requestId);
  const finalMessage =
    index !== null ? `#${index} ${message}` : message;

  const payload = {
    level,
    message: finalMessage,
    file,
    page,
    requestId,
    sessionEmail,
    userId,
    data,
    timestamp: createdAt.toISOString(),
  };

  // 1. Axiom (non-blocking)
  try {
    const ax = axiomFor(level);
    ax(finalMessage, payload);
  } catch {}

  // 2. Neon via Prisma (structured)
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
