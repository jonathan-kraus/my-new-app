// app/astronomy/loader.ts
import { normalizeAstronomySnapshot } from "@/lib/astronomy/normalize";
import { NormalizedAstronomySnapshotSchema } from "@/lib/astronomy/types";
interface RawAstronomyRow {
  date: string;
  sunrise: string | null;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
  moonPhase?: number | null;
  tomorrowSunrise?: string | null;
  tomorrowSunset?: string | null;
  tomorrowMoonrise?: string | null;
  tomorrowMoonset?: string | null;
}

export async function loadAstronomySnapshots() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/astronomy`, {
    cache: "no-store",
  });

  const snapshots: RawAstronomyRow[] = await res.json();
  const normalized = snapshots.map(normalizeAstronomySnapshot);
  const validated = normalized.map((snap) => {
    const parsed = NormalizedAstronomySnapshotSchema.safeParse(snap);
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA", {
      timeZone: "America/New_York",
    });
    const tomorrowStr = new Date(now.getTime() + 86400000).toLocaleDateString(
      "en-CA",
      {
        timeZone: "America/New_York",
      },
    );
    const today = validated.find(
      (snap) =>
        snap.date.toLocaleDateString("en-CA", {
          timeZone: "America/New_York",
        }) === todayStr,
    );
    const tomorrow = validated.find(
      (snap) =>
        snap.date.toLocaleDateString("en-CA", {
          timeZone: "America/New_York",
        }) === tomorrowStr,
    );
    console.log(today, tomorrow);
    if (!parsed.success) {
      console.error(
        "❌ Astronomy snapshot validation failed:",
        parsed.error.format(),
      );
      throw new Error("Invalid astronomy snapshot");
    }
    return parsed.data;
  });
  const sorted = snapshots.sort((a, b) => a.date.localeCompare(b.date));

  const todayStr = new Date().toISOString().slice(0, 10);

  const todayRaw = sorted.find((s) => s.date === todayStr);
  const tomorrowRaw = sorted.find((s) => s.date > todayStr);

  return {
    today: todayRaw ? normalizeAstronomySnapshot(todayRaw).today : null,
    tomorrow: tomorrowRaw
      ? normalizeAstronomySnapshot(tomorrowRaw).tomorrow
      : null,
  };
}
