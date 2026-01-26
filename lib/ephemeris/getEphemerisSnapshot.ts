import { db } from "@/lib/db";
import { EphemerisEvent } from "@/lib/ephemeris/types";
import { buildEvent } from "@/lib/astronomy/buildEvent";
import { getPhaseName } from "@/lib/astronomy/getPhaseName";

export async function getEphemerisSnapshot(locationId: string) {
  const row = await db.astronomySnapshot.findFirst({
    where: { locationId },
    orderBy: { date: "desc" },
  });

  if (!row) throw new Error("No ephemeris data found");

  const solar = {
    sunrise: buildEvent("Sunrise", row.sunrise, "solar")!,
    sunset: buildEvent("Sunset", row.sunset, "solar")!,

    blueHour: {
      sunrise: {
        start: buildEvent("Sunrise Blue Start", row.sunriseBlueStart, "solar"),
        end: buildEvent("Sunrise Blue End", row.sunriseBlueEnd, "solar"),
      },
      sunset: {
        start: buildEvent("Sunset Blue Start", row.sunsetBlueStart, "solar"),
        end: buildEvent("Sunset Blue End", row.sunsetBlueEnd, "solar"),
      },
    },

    goldenHour: {
      sunrise: {
        start: buildEvent(
          "Sunrise Golden Start",
          row.sunriseGoldenStart,
          "solar",
        ),
        end: buildEvent("Sunrise Golden End", row.sunriseGoldenEnd, "solar"),
      },
      sunset: {
        start: buildEvent(
          "Sunset Golden Start",
          row.sunsetGoldenStart,
          "solar",
        ),
        end: buildEvent("Sunset Golden End", row.sunsetGoldenEnd, "solar"),
      },
    },
  };

  const lunar = {
    date: row.date.toISOString(),
    moonrise: buildEvent("Moonrise", row.moonrise, "lunar"),
    moonset: buildEvent("Moonset", row.moonset, "lunar"),
    illumination: row.moonPhase,
    phaseName: getPhaseName(row.moonPhase),
  };

  // Determine next event (simple example)
  const events = [
    solar.sunrise,
    solar.sunset,
    lunar.moonrise,
    lunar.moonset,
  ].filter(Boolean) as EphemerisEvent[];

  const now = Date.now();
  const nextEvent = events
    .filter((e) => new Date(e.timestamp).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )[0];

  return {
    solar,
    lunar,
    nextEvent,
    fetchedAt: new Date().toISOString(),
  };
}
