import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export async function getAstronomySnapshot(locationId: string = "KOP") {
  const now = new Date();

  // Try to get today's snapshot
  const todaySnapshot = await db.astronomySnapshot.findFirst({
    where: {
      locationId,
      fetchedAt: {
        gte: startOfDay(now),
        lte: endOfDay(now),
      },
    },
    orderBy: { fetchedAt: "desc" },
  });

  if (todaySnapshot) {
    return {
      date: todaySnapshot.fetchedAt,
      sunrise: todaySnapshot.sunrise,
      sunset: todaySnapshot.sunset,
      moonrise: todaySnapshot.moonrise,
      moonset: todaySnapshot.moonset,
      sunriseBlueStart: todaySnapshot.sunriseBlueStart,
      sunriseBlueEnd: todaySnapshot.sunriseBlueEnd,
      sunriseGoldenStart: todaySnapshot.sunriseGoldenStart,
      sunriseGoldenEnd: todaySnapshot.sunriseGoldenEnd,
      sunsetGoldenStart: todaySnapshot.sunsetGoldenStart,
      sunsetGoldenEnd: todaySnapshot.sunsetGoldenEnd,
      sunsetBlueStart: todaySnapshot.sunsetBlueStart,
      sunsetBlueEnd: todaySnapshot.sunsetBlueEnd,
    };
  }

  // Fallback: most recent snapshot
  const latest = await db.astronomySnapshot.findFirst({
    where: { locationId },
    orderBy: { fetchedAt: "desc" },
  });

  if (!latest) {
    throw new Error("No astronomy snapshots found");
  }

  return {
    date: latest.fetchedAt,
    sunrise: latest.sunrise,
    sunset: latest.sunset,
    moonrise: latest.moonrise,
    moonset: latest.moonset,
    sunriseBlueStart: latest.sunriseBlueStart,
    sunriseBlueEnd: latest.sunriseBlueEnd,
    sunriseGoldenStart: latest.sunriseGoldenStart,
    sunriseGoldenEnd: latest.sunriseGoldenEnd,
    sunsetGoldenStart: latest.sunsetGoldenStart,
    sunsetGoldenEnd: latest.sunsetGoldenEnd,
    sunsetBlueStart: latest.sunsetBlueStart,
    sunsetBlueEnd: latest.sunsetBlueEnd,
  };
}
