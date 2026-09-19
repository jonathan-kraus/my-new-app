import { fetchAstronomyMultiDay } from "./astronomy-provider";
import { computeGoldenBlueHours } from "@/lib/computeGoldenBlueHours";
import { db8 } from "./db.prisma8";
import { createId } from "@paralleldrive/cuid2";
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

        // Build the snapshot using the actual Date object.
        const snapshot = await buildAstronomySnapshot(location, day.date);

        // Atomic upsert on the existing composite unique index.
        const plan = db8.raw.sql`
          INSERT INTO "AstronomySnapshot" ("id", "locationId", "dateString", "fetchedAt", "sunrise", "sunset", "solarNoon", "sunriseBlueStart", "sunriseBlueEnd", "sunsetBlueStart", "sunsetBlueEnd", "sunriseGoldenStart", "sunriseGoldenEnd", "sunsetGoldenStart", "sunsetGoldenEnd", "moonrise", "moonset", "illumination", "phaseName", "moonPhase")
          SELECT "id", "locationId", "dateString", "fetchedAt", "sunrise", "sunset", "solarNoon", "sunriseBlueStart", "sunriseBlueEnd", "sunsetBlueStart", "sunsetBlueEnd", "sunriseGoldenStart", "sunriseGoldenEnd", "sunsetGoldenStart", "sunsetGoldenEnd", "moonrise", "moonset", "illumination", "phaseName", "moonPhase"
          FROM jsonb_populate_record(NULL::"AstronomySnapshot", ${JSON.stringify(
            {
              ...snapshot,
              id: createId(),
              locationId: location.id,
              dateString,
              fetchedAt: snapshot.fetchedAt.toISOString().slice(0, -1),
            },
          )}::jsonb)
          ON CONFLICT ("locationId", "dateString") DO UPDATE SET
          "fetchedAt" = EXCLUDED."fetchedAt",
          "sunrise" = EXCLUDED."sunrise",
          "sunset" = EXCLUDED."sunset",
          "solarNoon" = EXCLUDED."solarNoon",
          "sunriseBlueStart" = EXCLUDED."sunriseBlueStart",
          "sunriseBlueEnd" = EXCLUDED."sunriseBlueEnd",
          "sunsetBlueStart" = EXCLUDED."sunsetBlueStart",
          "sunsetBlueEnd" = EXCLUDED."sunsetBlueEnd",
          "sunriseGoldenStart" = EXCLUDED."sunriseGoldenStart",
          "sunriseGoldenEnd" = EXCLUDED."sunriseGoldenEnd",
          "sunsetGoldenStart" = EXCLUDED."sunsetGoldenStart",
          "sunsetGoldenEnd" = EXCLUDED."sunsetGoldenEnd",
          "moonrise" = EXCLUDED."moonrise",
          "moonset" = EXCLUDED."moonset",
          "illumination" = EXCLUDED."illumination",
          "phaseName" = EXCLUDED."phaseName",
          "moonPhase" = EXCLUDED."moonPhase"
        `
          .affectedCount()
          .build();
        return db8.runtime().execute(plan);
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
