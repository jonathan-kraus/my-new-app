// lib\astronomy\buildEvent.ts
import { EphemerisEvent } from "@/lib/ephemeris/types";
function buildEvent(
  name: string,
  timestamp: string | null,
  type: "solar" | "lunar",
): EphemerisEvent | null {
  if (!timestamp) return null;

  const dateObj = new Date(timestamp);

  return {
    name,
    timestamp,
    timeLocal: dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    date: timestamp.split("T")[0],
    isTomorrow: false, // optional: compute if needed
    type,
  };
}

export { buildEvent };
