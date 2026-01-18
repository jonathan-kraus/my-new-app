// app/astronomy/loader.ts
import { normalizeAstronomySnapshot } from "@/lib/astronomy/normalize";

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
