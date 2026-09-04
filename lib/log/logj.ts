/*
 * Universal logger entry point
 * Decides server vs client at runtime
 */

/*
 * Universal logger entry point
 */

import type { LogjInput } from "@/lib/log/types";
import { serverLog, safeForNeon } from "./server";
import { clientLog } from "./client";

export async function logj(input: LogjInput) {
  if (typeof window === "undefined") {
    return serverLog(input);
  }
  return clientLog(input);
}

// Re-export for tests
export { safeForNeon };

// Shorthand methods
logj.info = (input: Omit<LogjInput, "level">) =>
  logj({ ...input, level: "info" });

logj.warn = (input: Omit<LogjInput, "level">) =>
  logj({ ...input, level: "warn" });

logj.error = (input: Omit<LogjInput, "level">) =>
  logj({ ...input, level: "error" });

logj.debug = (input: Omit<LogjInput, "level">) =>
  logj({ ...input, level: "debug" });
