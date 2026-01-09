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

    await Promise.all(
      computedDays.map((day) =>
        db.astronomySnapshot.upsert({
          where: {
            locationId_date: {
              locationId: location.id,
              date: day.date,
            },
          },
          update: buildAstronomySnapshot(day, location.id),
          create: buildAstronomySnapshot(day, location.id),
        }),
      ),
    );

    return { locationId: location.id, ok: true };
  } catch (err) {
    return { locationId: location.id, error: String(err) };
  }
}

export async function getAstronomyForDashboard(locationId: string) {
  // Fetch all snapshots for this location, sorted by date
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

  // Determine today's local date (midnight)
  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Find today's snapshot
  const todaySnapshot =
    snapshots.find((snap) => {
      const d = snap.date;
      return (
        d.getFullYear() === todayLocal.getFullYear() &&
        d.getMonth() === todayLocal.getMonth() &&
        d.getDate() === todayLocal.getDate()
      );
    }) ?? null;

  // Find tomorrow's snapshot
  const tomorrowLocal = new Date(
    todayLocal.getFullYear(),
    todayLocal.getMonth(),
    todayLocal.getDate() + 1,
  );

  const tomorrowSnapshot =
    snapshots.find((snap) => {
      const d = snap.date;
      return (
        d.getFullYear() === tomorrowLocal.getFullYear() &&
        d.getMonth() === tomorrowLocal.getMonth() &&
        d.getDate() === tomorrowLocal.getDate()
      );
    }) ?? null;

  return {
    todaySnapshot,
    tomorrowSnapshot,
    allSnapshots: snapshots,
  };
}
