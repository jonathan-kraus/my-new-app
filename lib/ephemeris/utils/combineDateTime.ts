// lib/ephemeris/utils/combineDateTime.ts

import { logit } from "@/lib/log/logit";
import { getConfig } from "@/lib/runtime/config";

let dl: number | null = null;

function loadDebugLevelSync() {
  // Lazy-load once, but without async.
  // If getConfig() is async, we fall back to default "11".
  if (dl !== null) return dl;

  try {
    // getConfig may return a Promise in real runtime,
    // but during tests we mock it to return a string synchronously.
    const maybe = getConfig("debug.logging", "11");

    if (typeof maybe === "string" || typeof maybe === "number") {
      dl = Number(maybe);
    } else {
      // If it's a Promise (real runtime), don't block.
      // Use fallback and let real logging config load elsewhere.
      dl = 11;
    }
  } catch {
    dl = 11;
  }

  return dl;
}

const domain = "ephemeris";
const eventIndex = 22;
const requestId = crypto.randomUUID();
/**
 * Combines a JS Date (representing the *day*) with a time string
 * that already includes a timezone offset (e.g. "07:09:00-05:00").
 *
 * Returns a fully-qualified ISO string with the original offset preserved.
 *
 * NEVER returns UTC. NEVER strips the offset.
 */
export function combineDateTime(date: Date, timeString: string): string {
  const debugLevel = loadDebugLevelSync();

  if (debugLevel === 1) {
    logit(
      domain,
      {
        level: "debug",
        message: "combineDateTime called",
        data: { date: date.toString(), timeString },
      },
      { eventIndex },
      {
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );
  }

  // --- VALIDATION: Reject UTC timestamps ---
  if (timeString.endsWith("Z")) {
    logit(
      domain,
      {
        level: "error",
        message: "UTC timestamp detected in combineDateTime",
        data: { timeString },
      },
      { eventIndex },
      {
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );

    throw new Error(
      `combineDateTime received a UTC timestamp (${timeString}). ` +
        `All ephemeris times must include a local offset.`,
    );
  }

  // --- VALIDATION: Ensure offset exists ---
  const offsetMatch = timeString.match(/([+-]\d{2}:\d{2})$/);
  if (!offsetMatch) {
    logit(
      domain,
      {
        level: "error",
        message: "Time string missing timezone offset",
        data: { timeString },
      },
      { eventIndex },
      {
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );

    throw new Error(
      `combineDateTime expected a time string with offset (e.g. "07:09:00-05:00"), got: ${timeString}`,
    );
  }

  const offset = offsetMatch[1];

  // Extract HH:mm:ss
  const timePart = timeString.replace(offset, "");

  // Build YYYY-MM-DD from the provided date
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const final = `${yyyy}-${mm}-${dd}T${timePart}${offset}`;

  if (debugLevel === 1) {
    logit(
      domain,
      {
        level: "debug",
        message: "combineDateTime produced final timestamp",
        data: { final },
      },
      { eventIndex },
      {
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );
  }

  return final;
}
