import { fetchAstronomyMultiDay } from "./astronomy-provider";
import { computeGoldenBlueHours } from "@/lib/computeGoldenBlueHours";
import { db8 } from "./db.prisma8";
import { createId } from "@paralleldrive/cuid2";
import { varchar10 } from "@/lib/timestampString";
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
        const dateString = varchar10(format(day.date, "yyyy-MM-dd"));

        // Build the snapshot using the actual Date object.
        const snapshot = await buildAstronomySnapshot(location, day.date);

        const dateString8 = varchar10(dateString);

        const existing = await db8.orm.public.AstronomySnapshot.where(
          (snapshot) => snapshot.locationId.eq(location.id),
        )
          .where((snapshot) => snapshot.dateString.eq(dateString8))
          .first();

        const snapshot8 = {
          ...snapshot,
          locationId: location.id,
          dateString: dateString8,
        };

        if (existing) {
          return db8.orm.public.AstronomySnapshot.where({
            id: existing.id,
          }).update(snapshot8);
        }

        return db8.orm.public.AstronomySnapshot.create({
          id: createId(),
          ...snapshot8,
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
  const rows = await db8.orm.public.AstronomySnapshot.where({ locationId })
    .orderBy((snapshot) => snapshot.dateString.asc())
    .all();
  const snapshots = rows.map(({ fetchedAt, ...snapshot }) => ({
    ...snapshot,
    fetchedAt: new Date(`${fetchedAt}Z`),
  }));

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

export type AstronomySnapshot = Awaited<
  ReturnType<typeof getAstronomyForDashboard>
>["allSnapshots"][number];
