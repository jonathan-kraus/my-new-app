import { getSolarSnapshot } from "./getSolarSnapshot";
import { getLunarSnapshot } from "./getLunarSnapshot";

export async function getEphemerisSnapshot(locationId = "KOP") {
  return {
    solar: await getSolarSnapshot(locationId),
    lunar: await getLunarSnapshot(locationId),
    fetchedAt: new Date().toISOString(),
  };
}
