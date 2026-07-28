// lib/astronomy/getAstronomySnapshot.ts

import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { format, addDays } from "date-fns";

const getCachedAstronomySnapshot = unstable_cache(
  async (locationId: string, todayStr: string, tomorrowStr: string) => {
    const today = await db.astronomySnapshot.findUnique({
      where: {
        locationId_dateString: {
          locationId,
          dateString: todayStr,
        },
      },
    });

    const tomorrow = await db.astronomySnapshot.findUnique({
      where: {
        locationId_dateString: {
          locationId,
          dateString: tomorrowStr,
        },
      },
    });

    // This should now only run on a real cache miss
    const built = await staticUniversalContext("ASTRONOMY_SNAPSHOT");
    await logj({
      domain: "jonathan",
      level: "info",
      message: "Astronomy snapshot fetched",
      file: "lib/astronomy/getAstronomySnapshot.ts",
      line: 47,
      payload: { today },
      meta: { built: { ...built, eventIndex: 1 } },
    });

    return { today, tomorrow };
  },
  ["astronomy-snapshot"], // base key
  {
    revalidate: 60 * 60 * 24, // 24 hours
    tags: ["astronomy-snapshot"], // you can make this more specific if needed
  },
);

export async function getAstronomySnapshot(
  locationId: string,
  now = new Date(),
) {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { today: null, tomorrow: null };
  }

  const todayStr = format(now, "yyyy-MM-dd");
  const tomorrowStr = format(addDays(now, 1), "yyyy-MM-dd");

  return getCachedAstronomySnapshot(locationId, todayStr, tomorrowStr);
}
