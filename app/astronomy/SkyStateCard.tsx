"use client";

import { SolarTimes } from "@/types/AstronomyTypes";

function getSkyState(now: Date, solar: SolarTimes) {
  const {
    sunrise,
    sunset,
    sunriseBlueStart,
    sunriseBlueEnd,
    sunriseGoldenStart,
    sunriseGoldenEnd,
    sunsetGoldenStart,
    sunsetGoldenEnd,
    sunsetBlueStart,
    sunsetBlueEnd,
  } = solar;

  if (!sunrise || !sunset) return "No Data";

  if (sunriseBlueStart && now < sunriseBlueStart) return "Night";
  if (sunriseBlueStart && sunriseBlueEnd && now < sunriseBlueEnd)
    return "Blue Hour (Morning)";
  if (sunriseGoldenStart && sunriseGoldenEnd && now < sunriseGoldenEnd)
    return "Golden Hour (Morning)";
  if (sunsetGoldenStart && now < sunsetGoldenStart) return "Day";
  if (sunsetGoldenStart && sunsetGoldenEnd && now < sunsetGoldenEnd)
    return "Golden Hour (Evening)";
  if (sunsetBlueStart && sunsetBlueEnd && now < sunsetBlueEnd)
    return "Blue Hour (Evening)";

  return "Night";
}

export function SkyStateCard({ solar }: { solar: SolarTimes }) {
  const now = new Date();
  const state = getSkyState(now, solar);

  return (
    <div className="rounded-xl border bg-black/20 p-4 text-white shadow-lg backdrop-blur">
      <h2 className="text-lg font-semibold">Sky State</h2>
      <p className="text-xl mt-2">{state}</p>
    </div>
  );
}
