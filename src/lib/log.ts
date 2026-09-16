/*
 * @FilePath: \my-new-app\src\lib\log.ts
 * @LastEditTime: 2026-09-16 14:55:58
 */
// lib/log.ts
// On the server it calls logj() directly.
// On the client it POSTs to /api/log so the server can write to Neon + Axiom.

// lib/log.ts
import type { LogjInput } from "@/lib/log/types";

async function clientLog(input: LogjInput): Promise<void> {
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify(input),
    });
  } catch (err) {
    console.error("[log] Failed to send client log:", err);
  }
}

async function serverLog(input: LogjInput): Promise<void> {
  const { logj } = await import("@/lib/log/logj");
  await logj(input);
}

export async function log(input: LogjInput): Promise<void> {
  if (typeof window === "undefined") {
    await serverLog(input);
  } else {
    await clientLog(input);
  }
}

log.info = (input: Omit<LogjInput, "level">) =>
  log({ ...input, level: "info" });
log.warn = (input: Omit<LogjInput, "level">) =>
  log({ ...input, level: "warn" });
log.error = (input: Omit<LogjInput, "level">) =>
  log({ ...input, level: "error" });
log.debug = (input: Omit<LogjInput, "level">) =>
  log({ ...input, level: "debug" });
