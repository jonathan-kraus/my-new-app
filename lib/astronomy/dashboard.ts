// lib/astronomy/dashboard.ts

import { normalizeAstronomySnapshot } from "./normalize";
import { nextEvent } from "./countdown";
import { db } from "@/lib/db"; // adjust to your setup

export async function getAstronomyDashboard() {
  const row = await db.astronomySnapshot.findFirst({
    orderBy: { fetchedAt: "desc" },
  });

  if (!row) return null;

  const snap = normalizeAstronomySnapshot(row);

  const solar = nextEvent({
    sunrise: snap.today.sunrise,
    sunset: snap.today.sunset,
    tomorrowSunrise: snap.tomorrow.sunrise,
  });

  const lunar = nextEvent({
    moonrise: snap.today.moonrise,
    moonset: snap.today.moonset,
    tomorrowMoonrise: snap.tomorrow.moonrise,
  });

  return {
    today: snap.today,
    tomorrow: snap.tomorrow,
    solar,
    lunar,
  };
}
