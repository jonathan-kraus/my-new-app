// lib/ephemeris/getEphemerisSnapshot.ts

import { getSolarSnapshot } from "./getSolarSnapshot";
import { getLunarSnapshot } from "./getLunarSnapshot";

export async function getEphemerisSnapshot(locationId: string = "KOP") {
  const solar = await getSolarSnapshot(locationId);
  const lunar = await getLunarSnapshot(locationId);

  return {
    solar,
    lunar,
    fetchedAt: new Date().toISOString(),
  };
}
