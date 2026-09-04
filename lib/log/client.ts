/*
 * @FilePath: \my-new-app\lib\log\client.ts
 * @LastEditTime: 2026-09-04 00:10:38
 */
import type { LogjInput } from "@/lib/log/types";

// Prevent SSR from calling /api/log
async function clientLog(input: LogjInput): Promise<void> {
  if (typeof window === "undefined") {
    console.warn("[log/client] skipped: no window (server import?)");
    console.warn("Imported from:", __filename);
    console.warn("[log/client] attempted message:", input);
    console.warn("2 [log/client] attempted message:", input.message);
    console.warn(new Error("Import stack").stack);
    return;
  }

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
