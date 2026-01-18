// app/astronomy/loader.ts
import { NormalizedAstronomySnapshotSchema } from "@/lib/astronomy/types";
import { normalizeAstronomySnapshot } from "@/lib/astronomy/normalize";

export async function loadAstronomySnapshots() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/astronomy`, {
    cache: "no-store",
  });

  // API returns: { today, tomorrow }
  const data = await res.json();

  const rawToday = data.today ?? null;
  const rawTomorrow = data.tomorrow ?? null;

  // Normalize + validate TODAY
  const today =
    rawToday !== null
      ? NormalizedAstronomySnapshotSchema.parse(
          normalizeAstronomySnapshot(rawToday, rawTomorrow),
        )
      : null;

  // Normalize + validate TOMORROW
  const tomorrow =
    rawTomorrow !== null
      ? NormalizedAstronomySnapshotSchema.parse(
          normalizeAstronomySnapshot(rawTomorrow, null),
        )
      : null;

  return { today, tomorrow };
}
