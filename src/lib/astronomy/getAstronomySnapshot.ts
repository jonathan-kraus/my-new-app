// lib/astronomy/getAstronomySnapshot.ts

import { unstable_cache } from "next/cache";
import { db8 } from "@/lib/db.prisma8";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { format, addDays } from "date-fns";

const varchar10 = (value: string) =>
  value as `${string}` & { readonly __varcharLength: 10 };
const getCachedAstronomySnapshot = unstable_cache(
  async (locationId: string, todayStr: string, tomorrowStr: string) => {
    const today = await db8.orm.public.AstronomySnapshot.where((snapshot) =>
      snapshot.locationId.eq(locationId),
    )
      .where((snapshot) => snapshot.dateString.eq(varchar10(todayStr)))
      .first();

    const tomorrow = await db8.orm.public.AstronomySnapshot.where((snapshot) =>
      snapshot.locationId.eq(locationId),
    )
      .where((snapshot) => snapshot.dateString.eq(varchar10(tomorrowStr)))
      .first();

    // This should now only run on a real cache miss
    const built = await staticUniversalContext("ASTRONOMY_SNAPSHOT");
    await logj({
      domain: "jonathan",
      level: "info",
      message: "Astronomy snapshot fetched",
      file: "lib/astronomy/getAstronomySnapshot.ts",
      line: 31,
      payload: { today },
      meta: { built: { ...built, eventIndex: 1 } },
    });

    return { today, tomorrow };
  },
  ["astronomy-snapshot"], // base key
  {
    revalidate: 60 * 60 * 24, // 24 hours
    tags: ["astronomy-snapshot"], // you can make this more specific if needed
  },
);

async function getAstronomySnapshotInternal(
  locationId: string,
  todayStr: string,
  tomorrowStr: string,
) {
  const today = await db8.orm.public.AstronomySnapshot.where((snapshot) =>
    snapshot.locationId.eq(locationId),
  )
    .where((snapshot) => snapshot.dateString.eq(varchar10(todayStr)))
    .first();

  const tomorrow = await db8.orm.public.AstronomySnapshot.where((snapshot) =>
    snapshot.locationId.eq(locationId),
  )
    .where((snapshot) => snapshot.dateString.eq(varchar10(tomorrowStr)))
    .first();

  const built = await staticUniversalContext("ASTRONOMY_SNAPSHOT");
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Astronomy snapshot fetched",
    file: "lib/astronomy/getAstronomySnapshot.ts",
    line: 74,
    payload: { today },
    meta: { built: { ...built, eventIndex: 1 } },
  });

  return { today, tomorrow };
}

export async function getAstronomySnapshot(
  locationId: string,
  now = new Date(),
) {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { today: null, tomorrow: null };
  }

  const todayStr = format(now, "yyyy-MM-dd");
  const tomorrowStr = format(addDays(now, 1), "yyyy-MM-dd");

  // In test environment, bypass unstable_cache which doesn't work
  if (process.env.NODE_ENV === "test") {
    return getAstronomySnapshotInternal(locationId, todayStr, tomorrowStr);
  }

  return getCachedAstronomySnapshot(locationId, todayStr, tomorrowStr);
}
