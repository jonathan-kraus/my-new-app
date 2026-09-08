// lib/ephemeris/getEphemerisSnapshot.ts

import { getAstronomySnapshot } from "@/lib/astronomy/getAstronomySnapshot";
import { buildEphemerisSnapshot } from "@/lib/ephemeris/buildEphemerisSnapshot";

export async function getEphemerisSnapshot(locationId: string) {
  const { today, tomorrow } = await getAstronomySnapshot(locationId);

  // If the cron hasn't populated data yet
  if (!today || !tomorrow) {
    return {
      snapshot: null,
      nextEvent: null,
      today,
      tomorrow,
    };
  }

  // Build the unified ephemeris snapshot
  const snapshot = buildEphemerisSnapshot(today, tomorrow);

  return {
    snapshot,
    nextEvent: snapshot.nextEvent,
    today,
    tomorrow,
  };
}
