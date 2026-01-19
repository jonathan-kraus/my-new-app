import { fetchAstronomyMultiDay } from "./astronomy-provider";
import { computeGoldenBlueHours } from "@/lib/computeGoldenBlueHours";
import { db } from "./db";
import { buildAstronomySnapshot } from "./buildAstronomySnapshot";

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
        const snapshot = await buildAstronomySnapshot(location, day.date);

        return db.astronomySnapshot.upsert({
          where: {
            locationId_date: {
              locationId: location.id,
              date: day.date,
            },
          },
          update: snapshot,
          create: snapshot,
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
  return {
    jloc,
  };
}

export async function getAstronomyForDashboard(locationId: string) {
  const snapshots = await db.astronomySnapshot.findMany({
    where: { locationId },
    orderBy: { date: "asc" },
  });

  if (snapshots.length === 0) {
    return {
      todaySnapshot: null,
      tomorrowSnapshot: null,
      allSnapshots: [],
    };
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  const tomorrowISO = new Date(Date.now() + 86400000)
    .toISOString()
    .slice(0, 10);

  const todaySnapshot =
    snapshots.find((snap) => snap.date.toISOString().startsWith(todayISO)) ??
    null;

  const tomorrowSnapshot =
    snapshots.find((snap) => snap.date.toISOString().startsWith(tomorrowISO)) ??
    null;

  return {
    todaySnapshot,
    tomorrowSnapshot,
    allSnapshots: snapshots,
  };
}
