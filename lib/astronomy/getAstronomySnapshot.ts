// lib/astronomy/getAstronomySnapshot.ts

import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { format, addDays } from "date-fns";

export async function getAstronomySnapshot(
  locationId: string,
  now = new Date(),
) {
  // 🚫 Prevent DB + logging during build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return {
      today: null,
      tomorrow: null,
    };
  }

  const todayStr = format(now, "yyyy-MM-dd");
  const tomorrowStr = format(addDays(now, 1), "yyyy-MM-dd");

  // Cache key includes location + date so it automatically refreshes daily
  const getCachedSnapshot = unstable_cache(
    async () => {
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

      // This log now only runs on real cache miss
      const built = await staticUniversalContext("ASTRONOMY_SNAPSHOT");
      await logj({
        domain: "jonathan",
        level: "info",
        message: "Astronomy snapshot fetched",
        file: "lib/astronomy/getAstronomySnapshot.ts",
        line: 41,
        payload: { today },
        meta: { built: { ...built, eventIndex: 1 } },
      });

      return { today, tomorrow };
    },
    // Cache key parts
    [`astronomy-snapshot`, locationId, todayStr],
    {
      // Revalidate once a day (or set a shorter time if you prefer)
      revalidate: 60 * 60 * 24, // 24 hours
      tags: [`astronomy-snapshot-${locationId}`],
    },
  );

  return getCachedSnapshot();
}
