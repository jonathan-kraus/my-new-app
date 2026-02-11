import { fetchAstronomyMultiDay } from "./astronomy-provider";
import { computeGoldenBlueHours } from "@/lib/computeGoldenBlueHours";
import { db } from "./db";
import { buildAstronomySnapshot } from "./buildAstronomySnapshot";
import { format, addDays } from "date-fns";

export async function refreshAstronomySnapshotsForLocation(
  location: { id: string; latitude: number; longitude: number },
  days: number,
) {
  try {
    const rawDays = await fetchAstronomyMultiDay(
      location.latitude,
      location.longitude,
      days,
    );

    const computedDays = rawDays.map(computeGoldenBlueHours);

    const results = await Promise.all(
      computedDays.map(async (day) => {
        // Convert the date to YYYY-MM-DD
        const dateString = format(day.date, "yyyy-MM-dd");

        // Build the snapshot using the actual Date object
        const snapshot = await buildAstronomySnapshot(location, day.date);

        return db.astronomySnapshot.upsert({
          where: {
            locationId_dateString: {
              locationId: location.id,
              dateString,
            },
          },
          update: snapshot,
          create: {
            ...snapshot,
            locationId: location.id,
            dateString,
          },
        });
      }),
    );

    return {
      locationId: location.id,
      ok: true,
      daysProcessed: results.length,
    };
  } catch (err) {
    return {
      locationId: location.id,
      ok: false,
      error: String(err),
    };
  }
}

export async function getLatestLocation() {
  const jloc = "KOP";
  return { jloc };
}

export async function getAstronomyForDashboard(locationId: string) {
  const snapshots = await db.astronomySnapshot.findMany({
    where: { locationId },
    orderBy: { dateString: "asc" },
  });

  if (snapshots.length === 0) {
    return {
      todaySnapshot: null,
      tomorrowSnapshot: null,
      allSnapshots: [],
    };
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const todaySnapshot =
    snapshots.find((snap) => snap.dateString === todayStr) ?? null;

  const tomorrowSnapshot =
    snapshots.find((snap) => snap.dateString === tomorrowStr) ?? null;

  return {
    todaySnapshot,
    tomorrowSnapshot,
    allSnapshots: snapshots,
  };
}
