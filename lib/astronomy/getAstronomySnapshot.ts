// lib/astronomy/getAstronomySnapshot.ts

import { db } from "@/lib/db";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { format, addDays } from "date-fns";

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
  let jei = 0;
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Astronomy snapshot fetched",
    file: "lib/astronomy/getAstronomySnapshot.ts",
    line: 27,
    payload: { today: today },

    meta: { built: { ...built, eventIndex: ++jei } },
  });

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
