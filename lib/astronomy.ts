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
  return db.astronomySnapshot.findMany({
    where: { locationId },
    orderBy: { date: "asc" },
  });
}
