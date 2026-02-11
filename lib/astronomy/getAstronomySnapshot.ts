// lib/astronomy/getAstronomySnapshot.ts

import { db } from "@/lib/db";
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
