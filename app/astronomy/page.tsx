import { AstronomyClientPage } from "./AstronomyClientPage";
import { db } from "@/lib/db";
import { startOfDay, endOfDay, addDays } from "date-fns";

export default async function AstronomyPage() {
  const now = new Date();

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const tomorrowStart = startOfDay(addDays(now, 1));
  const tomorrowEnd = endOfDay(addDays(now, 1));

  const todaySnapshot = await db.astronomySnapshot.findFirst({
    where: {
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const tomorrowSnapshot = await db.astronomySnapshot.findFirst({
    where: {
      date: {
        gte: tomorrowStart,
        lte: tomorrowEnd,
      },
    },
  });

  return (
    <AstronomyClientPage
      data={{
        today: todaySnapshot,
        tomorrow: tomorrowSnapshot,
      }}
    />
  );
}
