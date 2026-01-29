import { startOfDay, addDays } from "date-fns";
import { db } from "@/lib/db";
import { normalizeAstronomySnapshot } from "@/lib/astronomy/normalize";

export async function getAstronomySnapshot(
  locationId: string,
  now = new Date(),
) {
  const todayLocalMidnight = startOfDay(
    new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" })),
  );

  const tomorrowLocalMidnight = addDays(todayLocalMidnight, 1);

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
