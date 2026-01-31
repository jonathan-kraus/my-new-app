// lib/ephemeris/utils/combineDateTime.ts

import { logit } from "@/lib/log/logit";

const domain = "ephemeris.combineDateTime";

/**
 * Combines a JS Date (representing the *day*) with a time string
 * that already includes a timezone offset (e.g. "07:09:00-05:00").
 *
 * Returns a fully-qualified ISO string with the original offset preserved.
 *
 * NEVER returns UTC. NEVER strips the offset.
 */
export function combineDateTime(date: Date, timeString: string): string {
  logit(domain, {
    level: "debug",
    message: "combineDateTime called",
    data: { date: date.toString(), timeString },
  });

  // --- VALIDATION: Reject UTC timestamps ---
  if (timeString.endsWith("Z")) {
    logit(domain, {
      level: "error",
      message: "UTC timestamp detected in combineDateTime",
      data: { timeString },
    });

    throw new Error(
      `combineDateTime received a UTC timestamp (${timeString}). ` +
        `All ephemeris times must include a local offset.`,
    );
  }

  // --- VALIDATION: Ensure offset exists ---
  const offsetMatch = timeString.match(/([+-]\d{2}:\d{2})$/);
  if (!offsetMatch) {
    logit(domain, {
      level: "error",
      message: "Time string missing timezone offset",
      data: { timeString },
    });

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

  logit(domain, {
    level: "debug",
    message: "combineDateTime produced final timestamp",
    data: { final },
  });

  return final;
}
