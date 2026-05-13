/*
 * @FilePath: \my-new-app\lib\log\client.ts
 * @LastEditTime: 2026-05-10 17:09:09
 */
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

export async function log(input: LogjInput): Promise<void> {
  await clientLog(input);
}

log.info = (input: Omit<LogjInput, "level">) =>
  log({ ...input, level: "info" });
log.warn = (input: Omit<LogjInput, "level">) =>
  log({ ...input, level: "warn" });
log.error = (input: Omit<LogjInput, "level">) =>
  log({ ...input, level: "error" });
log.debug = (input: Omit<LogjInput, "level">) =>
  log({ ...input, level: "debug" });
