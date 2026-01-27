"use server";
// lib\ephemeris\getEphemerisSnapshot.ts
import { db } from "@/lib/db";
import { buildEphemerisSnapshot } from "./buildEphemerisSnapshot";

// Returns YYYY-MM-DD in Eastern time
function getEasternDateString(offsetDays = 0) {
  const now = new Date();

  const easternString = now.toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  const eastern = new Date(easternString);
  eastern.setDate(eastern.getDate() + offsetDays);

  return eastern.toISOString().slice(0, 10); // SAFE: only for DB day matching
}

export async function getEphemerisSnapshot(locationId: string) {
  const todayStr = getEasternDateString(0);
  const tomorrowStr = getEasternDateString(1);

  // Fetch all rows for this location
  const rows = await db.astronomySnapshot.findMany({
    where: { locationId },
    orderBy: { date: "asc" },
  });

  // Match by calendar day ONLY — never use this for event logic
  const todayRow = rows.find(
    (r) => r.date.toISOString().slice(0, 10) === todayStr,
  );

  const tomorrowRow = rows.find(
    (r) => r.date.toISOString().slice(0, 10) === tomorrowStr,
  );

  if (!todayRow || !tomorrowRow) {
    throw new Error(
      `AstronomySnapshot must contain today (${todayStr}) and tomorrow (${tomorrowStr}) for ${locationId}.`,
    );
  }

  // Pass raw DB rows directly — timestamps are already perfect
  return buildEphemerisSnapshot(todayRow, tomorrowRow);
}
