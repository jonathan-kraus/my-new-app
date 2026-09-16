/*
 * @FilePath: \my-new-app\src\lib\log\client.ts
 * @LastEditTime: 2026-09-16 14:57:12
 */
import type { LogjInput } from "@/lib/log/types";

/*
 * Client-side log
 * Sends logs to /api/log
 */

export async function clientLog(input: LogjInput) {
  if (typeof window === "undefined") {
    console.warn("[log/client] skipped: no window (server import?)");
    console.warn("[log/client] attempted message:", input);
    console.warn("Imported from:", __filename);
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
    console.error("[log/client] Failed to send client log:", err);
  }
}
