// lib/astronomy/getAstronomySnapshot.ts

import { db } from "@/lib/db";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { format, addDays } from "date-fns";

const astronomyLogGuard = (globalThis as typeof globalThis & {
  __astronomySnapshotLogKeys?: Set<string>;
}).__astronomySnapshotLogKeys ??= new Set<string>();

export async function getAstronomySnapshot(
  locationId: string,
  now = new Date(),
) {
  // Compute today/tomorrow dateStrings
  const todayStr = format(now, "yyyy-MM-dd");
  const tomorrowStr = format(addDays(now, 1), "yyyy-MM-dd");

  // Fetch today's snapshot
  const today = await db.astronomySnapshot.findUnique({
    where: {
      locationId_dateString: {
        locationId,
        dateString: todayStr,
      },
    },
  });
  const built = await staticUniversalContext("ASTRONOMY_SNAPSHOT");
  const logKey = `${locationId}:${todayStr}`;
  const shouldLog = !astronomyLogGuard.has(logKey);

  if (shouldLog) {
    astronomyLogGuard.add(logKey);
    await logj({
      domain: "jonathan",
      level: "info",
      message: "Astronomy snapshot fetched",
      file: "lib/astronomy/getAstronomySnapshot.ts",
      line: 27,
      payload: { today },
      meta: { built: { ...built, eventIndex: 1 } },
    });
  }

  // Fetch tomorrow's snapshot
  const tomorrow = await db.astronomySnapshot.findUnique({
    where: {
      locationId_dateString: {
        locationId,
        dateString: tomorrowStr,
      },
    },
  });

  return {
    today,
    tomorrow,
  };
}
