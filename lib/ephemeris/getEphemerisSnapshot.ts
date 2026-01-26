import { db} from "@/lib/db";
import { buildEphemerisSnapshot } from "./buildEphemerisSnapshot";

function getEasternDateString(offsetDays = 0) {
  const now = new Date();

  const easternString = now.toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  const eastern = new Date(easternString);
  eastern.setDate(eastern.getDate() + offsetDays);

  return eastern.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function getEphemerisSnapshot(locationId: string) {
  const todayStr = getEasternDateString(0);
  const tomorrowStr = getEasternDateString(1);

  // Fetch all rows for this location
  const rows = await db.astronomySnapshot.findMany({
    where: { locationId },
    orderBy: { date: "asc" },
  });

  // Filter by YYYY-MM-DD only
  const todayRow = rows.find(
    (r) => r.date.toISOString().slice(0, 10) === todayStr
  );

  const tomorrowRow = rows.find(
    (r) => r.date.toISOString().slice(0, 10) === tomorrowStr
  );

  if (!todayRow || !tomorrowRow) {
    throw new Error(
      `AstronomySnapshot must contain today (${todayStr}) and tomorrow (${tomorrowStr}) for ${locationId}.`
    );
  }

  return buildEphemerisSnapshot(todayRow, tomorrowRow);
}
