// lib/astronomy/getAstronomySnapshot.ts

import { db } from "@/lib/db";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { format, addDays } from "date-fns";

const astronomySnapshotCache = ((
  globalThis as typeof globalThis & {
    __astronomySnapshotCache?: Map<
      string,
      Promise<{
        today: Awaited<ReturnType<typeof db.astronomySnapshot.findUnique>>;
        tomorrow: Awaited<ReturnType<typeof db.astronomySnapshot.findUnique>>;
      }>
    >;
  }
).__astronomySnapshotCache ??= new Map());

export async function getAstronomySnapshot(
  locationId: string,
  now = new Date(),
) {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { today: null, tomorrow: null };
  }

  const todayStr = format(now, "yyyy-MM-dd");
  const tomorrowStr = format(addDays(now, 1), "yyyy-MM-dd");
  const cacheKey = `${locationId}:${todayStr}`;

  let snapshotPromise = astronomySnapshotCache.get(cacheKey);

  if (!snapshotPromise) {
    // Create the promise first
    snapshotPromise = (async () => {
      const today = await db.astronomySnapshot.findUnique({
        where: {
          locationId_dateString: {
            locationId,
            dateString: todayStr,
          },
        },
      });

      // Only log once (when the cache is actually populated)
      const built = await staticUniversalContext("ASTRONOMY_SNAPSHOT");
      await logj({
        domain: "jonathan",
        level: "info",
        message: "Astronomy snapshot fetched",
        file: "lib/astronomy/getAstronomySnapshot.ts",
        line: 48,
        payload: { today },
        meta: { built: { ...built, eventIndex: 1 } },
      });

      const tomorrow = await db.astronomySnapshot.findUnique({
        where: {
          locationId_dateString: {
            locationId,
            dateString: tomorrowStr,
          },
        },
      });

      return { today, tomorrow };
    })();

    // Critical: set it immediately so concurrent callers reuse it
    astronomySnapshotCache.set(cacheKey, snapshotPromise);
  }

  return snapshotPromise;
}