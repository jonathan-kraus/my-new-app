// app/astronomy/loader.ts
import { NormalizedAstronomySnapshotSchema } from "@/lib/astronomy/types";
import { normalizeAstronomySnapshot } from "@/lib/astronomy/normalize";

export async function loadAstronomySnapshots() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/astronomy`, {
    cache: "no-store",
  });

  const data = await res.json();

  // API returns: { today, tomorrow }
  const rawToday = data.today ?? null;
  const rawTomorrow = data.tomorrow ?? null;

  const today =
    rawToday !== null
      ? NormalizedAstronomySnapshotSchema.parse(
          normalizeAstronomySnapshot(rawToday)
        )
      : null;

  const tomorrow =
    rawTomorrow !== null
      ? NormalizedAstronomySnapshotSchema.parse(
          normalizeAstronomySnapshot(rawTomorrow)
        )
      : null;

  return { today, tomorrow };
}
