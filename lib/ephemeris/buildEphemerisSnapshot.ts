import type { AstronomySnapshot } from "../generated/prisma/client";
import type { SolarSnapshot } from "@/lib/ephemeris/types";
import { EphemerisEvent, EphemerisSnapshot } from "./types";
import { getPhaseName } from "@/lib/astronomy/getPhaseName";
function buildEvent(
  name: string,
  ts: string | null,
  type: "solar" | "lunar",
  isTomorrow: boolean,
): EphemerisEvent | null {
  if (!ts) return null;

  const d = new Date(ts);

  return {
    name,
    timestamp: ts,
    dateObj: d,
    timeLocal: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    }),
    date: ts.slice(0, 10),
    type,
    isTomorrow,
  };
}

export function buildEphemerisSnapshot(
  todayRow: AstronomySnapshot,
  tomorrowRow: AstronomySnapshot,
): EphemerisSnapshot {
  const events = [
    // Today
    buildEvent("Sunrise", todayRow.sunrise, "solar", false),
    buildEvent("Sunset", todayRow.sunset, "solar", false),
    buildEvent("Moonrise", todayRow.moonrise, "lunar", false),
    buildEvent("Moonset", todayRow.moonset, "lunar", false),

    // Tomorrow
    buildEvent("Sunrise", tomorrowRow.sunrise, "solar", true),
    buildEvent("Sunset", tomorrowRow.sunset, "solar", true),
    buildEvent("Moonrise", tomorrowRow.moonrise, "lunar", true),
    buildEvent("Moonset", tomorrowRow.moonset, "lunar", true),
    // Today — Blue Hour
    buildEvent("Sunrise Blue Start", todayRow.sunriseBlueStart, "solar", false),
    buildEvent("Sunrise Blue End", todayRow.sunriseBlueEnd, "solar", false),
    buildEvent("Sunset Blue Start", todayRow.sunsetBlueStart, "solar", false),
    buildEvent("Sunset Blue End", todayRow.sunsetBlueEnd, "solar", false),

    // Today — Golden Hour
    buildEvent(
      "Sunrise Golden Start",
      todayRow.sunriseGoldenStart,
      "solar",
      false,
    ),
    buildEvent("Sunrise Golden End", todayRow.sunriseGoldenEnd, "solar", false),
    buildEvent(
      "Sunset Golden Start",
      todayRow.sunsetGoldenStart,
      "solar",
      false,
    ),
    buildEvent("Sunset Golden End", todayRow.sunsetGoldenEnd, "solar", false),

    // Tomorrow — Blue Hour
    buildEvent(
      "Sunrise Blue Start",
      tomorrowRow.sunriseBlueStart,
      "solar",
      true,
    ),
    buildEvent("Sunrise Blue End", tomorrowRow.sunriseBlueEnd, "solar", true),
    buildEvent("Sunset Blue Start", tomorrowRow.sunsetBlueStart, "solar", true),
    buildEvent("Sunset Blue End", tomorrowRow.sunsetBlueEnd, "solar", true),

    // Tomorrow — Golden Hour
    buildEvent(
      "Sunrise Golden Start",
      tomorrowRow.sunriseGoldenStart,
      "solar",
      true,
    ),
    buildEvent(
      "Sunrise Golden End",
      tomorrowRow.sunriseGoldenEnd,
      "solar",
      true,
    ),
    buildEvent(
      "Sunset Golden Start",
      tomorrowRow.sunsetGoldenStart,
      "solar",
      true,
    ),
    buildEvent("Sunset Golden End", tomorrowRow.sunsetGoldenEnd, "solar", true),
  ]
    .filter((e): e is EphemerisEvent => e !== null)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  // NOW define helper functions
  function find(name: string, date: string) {
    return events.find((e) => e.name === name && e.date === date)!;
  }

  const now = new Date();
  const nextEvent = events.find((e) => e.dateObj > now);

  if (!nextEvent) {
    throw new Error("No upcoming astronomy events found.");
  }

  const todayStr = todayRow.date.toISOString().slice(0, 10);

  const solar: SolarSnapshot = {
    sunrise: find("Sunrise", todayStr),
    sunset: find("Sunset", todayStr),

    blueHour: {
      sunrise: {
        start: find("Sunrise Blue Start", todayStr),
        end: find("Sunrise Blue End", todayStr),
      },
      sunset: {
        start: find("Sunset Blue Start", todayStr),
        end: find("Sunset Blue End", todayStr),
      },
    },

    goldenHour: {
      sunrise: {
        start: find("Sunrise Golden Start", todayStr),
        end: find("Sunrise Golden End", todayStr),
      },
      sunset: {
        start: find("Sunset Golden Start", todayStr),
        end: find("Sunset Golden End", todayStr),
      },
    },
  };

  return {
    solar,
    lunar: {
      date: todayStr,
      illumination: todayRow.moonPhase, // ← your DB field
      phaseName: getPhaseName(todayRow.moonPhase), // ← you already have this helper
      moonrise: find("Moonrise", todayStr),
      moonset: find("Moonset", todayStr),
    },

    nextEvent,
    fetchedAt: new Date().toISOString(),
  };
}
