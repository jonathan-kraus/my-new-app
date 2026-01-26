import { getPhaseName } from "@/lib/astronomy/getPhaseName";
import { EphemerisEvent } from "@/lib/ephemeris/types";
import { AstronomySnapshot } from "@prisma/client";

function buildEvent(
  name: string,
  ts: string | null,
  type: "solar" | "lunar"
): EphemerisEvent | null {
  if (!ts) return null;

  const d = new Date(ts);

  return {
    name,
    timestamp: ts,
    timeLocal: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    date: ts.split("T")[0],
    isTomorrow: false,
    type,
  };
}


export function buildEphemerisSnapshot(
  todayRow: AstronomySnapshot,
  tomorrowRow: AstronomySnapshot )
  {
  // --- Solar ---
  const solar = {
    sunrise: buildEvent("Sunrise", todayRow.sunrise, "solar")!,
    sunset: buildEvent("Sunset", todayRow.sunset, "solar")!,

    blueHour: {
      sunrise: {
        start: buildEvent(
          "Sunrise Blue Start",
          todayRow.sunriseBlueStart,
          "solar",
        ),
        end: buildEvent("Sunrise Blue End", todayRow.sunriseBlueEnd, "solar"),
      },
      sunset: {
        start: buildEvent(
          "Sunset Blue Start",
          todayRow.sunsetBlueStart,
          "solar",
        ),
        end: buildEvent("Sunset Blue End", todayRow.sunsetBlueEnd, "solar"),
      },
    },

    goldenHour: {
      sunrise: {
        start: buildEvent(
          "Sunrise Golden Start",
          todayRow.sunriseGoldenStart,
          "solar",
        ),
        end: buildEvent(
          "Sunrise Golden End",
          todayRow.sunriseGoldenEnd,
          "solar",
        ),
      },
      sunset: {
        start: buildEvent(
          "Sunset Golden Start",
          todayRow.sunsetGoldenStart,
          "solar",
        ),
        end: buildEvent("Sunset Golden End", todayRow.sunsetGoldenEnd, "solar"),
      },
    },
  };

  // --- Lunar ---
  const lunar = {
    date: todayRow.date.toISOString(), // FIXED: must be string
    moonrise: buildEvent("Moonrise", todayRow.moonrise, "lunar"),
    moonset: buildEvent("Moonset", todayRow.moonset, "lunar"),
    illumination: todayRow.moonPhase,
    phaseName: getPhaseName(todayRow.moonPhase),
  };

  // --- Next Event ---
  const now = Date.now();

const events = [
  solar.sunrise,
  solar.sunset,
  lunar.moonrise,
  lunar.moonset,
  buildEvent("Sunrise", tomorrowRow.sunrise, "solar"),
  buildEvent("Sunset", tomorrowRow.sunset, "solar"),
  buildEvent("Moonrise", tomorrowRow.moonrise, "lunar"),
  buildEvent("Moonset", tomorrowRow.moonset, "lunar"),
]
  .filter((e): e is EphemerisEvent => e !== null)   // <-- TYPE NARROWING
  .map(e => ({
    ...e,
    dateObj: new Date(e.timestamp),
  }));


  const nextEvent = events[0];
    if (!nextEvent) {
      throw new Error("No upcoming astronomy events found for today/tomorrow");
    }
  return {
    solar,
    lunar,
    nextEvent,
    fetchedAt: new Date().toISOString(),
  };
}
