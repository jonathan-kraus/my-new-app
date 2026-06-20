/*
 * @FilePath: \my-new-app\lib\log\client.ts
 * @LastEditTime: 2026-06-20 13:24:46
 */
import type { LogjInput } from "@/lib/log/types";

// --- Internal client-side safe fetch ---
async function clientLog(input: LogjInput): Promise<void> {
  // Prevent SSR from calling /api/log
  if (typeof window === "undefined") return;

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

// --- Main exported logger ---
export async function logj(input: LogjInput): Promise<void> {
  await clientLog(input);
}

// --- Convenience helpers ---
logj.info = (input: Omit<LogjInput, "level">) =>
  logj({ ...input, level: "info" });

logj.warn = (input: Omit<LogjInput, "level">) =>
  logj({ ...input, level: "warn" });

logj.error = (input: Omit<LogjInput, "level">) =>
  logj({ ...input, level: "error" });

logj.debug = (input: Omit<LogjInput, "level">) =>
  logj({ ...input, level: "debug" });
