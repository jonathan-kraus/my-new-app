import { addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { db } from "@/lib/db";
import { normalizeAstronomySnapshot } from "@/lib/astronomy/normalize";

const TZ = "America/New_York";

function easternMidnight(date: Date) {
  // Convert "now" into Eastern Time
  const zoned = toZonedTime(date, TZ);

  // Build midnight in Eastern Time
  const midnightInET = new Date(
    zoned.getFullYear(),
    zoned.getMonth(),
    zoned.getDate(),
    0, 0, 0, 0
  );

  // Convert that Eastern-midnight timestamp back to UTC
  return toZonedTime(midnightInET, "UTC");
}

export async function getAstronomySnapshot(
  locationId: string,
  now = new Date(),
) {
  const todayLocalMidnight = easternMidnight(now);
  const tomorrowLocalMidnight = easternMidnight(addDays(now, 1));

  const rawToday = await db.astronomySnapshot.findFirst({
    where: { locationId, date: todayLocalMidnight },
  });

  const rawTomorrow = await db.astronomySnapshot.findFirst({
    where: { locationId, date: tomorrowLocalMidnight },
  });

  return {
    today: normalizeAstronomySnapshot(rawToday),
    tomorrow: normalizeAstronomySnapshot(rawTomorrow),
  };
}
