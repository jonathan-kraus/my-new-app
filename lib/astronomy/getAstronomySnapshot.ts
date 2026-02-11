import { addDays } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { db } from "@/lib/db";
import { normalizeAstronomySnapshot } from "@/lib/astronomy/normalize";

const TZ = "America/New_York";

function easternMidnight(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Construct midnight in Eastern Time, then convert to UTC for DB comparison
  return zonedTimeToUtc(new Date(year, month, day, 0, 0, 0), TZ);
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
