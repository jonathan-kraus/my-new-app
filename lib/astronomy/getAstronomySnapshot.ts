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
  // 🚫 Prevent DB + logging during build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return {
      today: null,
      tomorrow: null,
    };
  }

  const todayStr = format(now, "yyyy-MM-dd");
  const tomorrowStr = format(addDays(now, 1), "yyyy-MM-dd");
  const cacheKey = `${locationId}:${todayStr}`;

  let snapshotPromise = astronomySnapshotCache.get(cacheKey);
  if (!snapshotPromise) {
    snapshotPromise = (async () => {
      const today = await db.astronomySnapshot.findUnique({
        where: {
          locationId_dateString: {
            locationId,
            dateString: todayStr,
          },
        },
      });

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

    astronomySnapshotCache.set(cacheKey, snapshotPromise);

    snapshotPromise = snapshotPromise.catch((error: unknown) => {
      astronomySnapshotCache.delete(cacheKey);
      throw error;
    });
  }

  return snapshotPromise;
}
