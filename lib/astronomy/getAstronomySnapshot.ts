import { startOfDay, addDays } from "date-fns";
import { db } from "@/lib/db";

export async function getAstronomySnapshot(
  locationId: string,
  now = new Date(),
) {
  // Compute local midnight for today
  const todayLocalMidnight = startOfDay(
    new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" })),
  );

  // Compute local midnight for tomorrow
  const tomorrowLocalMidnight = addDays(todayLocalMidnight, 1);

  // Fetch today's snapshot by astronomy date (NOT fetchedAt)
  const todaySnapshot = await db.astronomySnapshot.findFirst({
    where: {
      locationId,
      date: todayLocalMidnight,
    },
  });

  // Fetch tomorrow's snapshot
  const tomorrowSnapshot = await db.astronomySnapshot.findFirst({
    where: {
      locationId,
      date: tomorrowLocalMidnight,
    },
  });

  return {
    today: todaySnapshot,
    tomorrow: tomorrowSnapshot,
  };
}
