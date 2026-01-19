"use client";

import { SolarTimes, LunarTimes } from "@/types/AstronomyTypes";
import { SolarProgress } from "./components/SolarProgress";
import { LunarIllumination } from "./components/LunarIllumination";
import { formatTime } from "@/lib/astronomy/formatTime";
export function CombinedSolarLunarTimeline({
  solarToday,
  solarTomorrow,
  lunarToday,
  lunarTomorrow,
}: {
  solarToday: SolarTimes;
  solarTomorrow: SolarTimes | null;
  lunarToday: LunarTimes;
  lunarTomorrow: LunarTimes | null;
}) {
  return (
    <div className="rounded-xl border bg-black/20 p-4 text-white shadow-lg backdrop-blur space-y-6">
      <h2 className="text-lg font-semibold">Solar & Lunar Timeline</h2>

      {/* Solar */}
      <div>
        <h3 className="font-semibold mb-2">☀️ Solar</h3>

        <div className="flex justify-between text-sm opacity-80 mb-1">
          <span>🌅 Sunrise</span>
          <span>{formatTime(solarToday.sunrise)}</span>
        </div>

        <div className="flex justify-between text-sm opacity-80 mb-1">
          <span>🌇 Sunset</span>
          <span>{formatTime(solarToday.sunset)}</span>
        </div>

        <SolarProgress
          sunrise={solarToday.sunrise}
          sunset={solarToday.sunset}
        />

        <div className="flex justify-between text-sm opacity-80 mt-1">
          <span>Tomorrow</span>
          <span>{formatTime(solarTomorrow?.sunrise ?? null)}</span>
        </div>
      </div>

      {/* Lunar */}
      <div>
        <h3 className="font-semibold mb-2">🌙 Lunar</h3>

        <div className="flex justify-between text-sm opacity-80 mb-1">
          <span>🌔 Moonrise</span>
          <span>{formatTime(lunarToday.moonrise)}</span>
        </div>

        <div className="flex justify-between text-sm opacity-80 mb-1">
          <span>🌘 Moonset</span>
          <span>{formatTime(lunarToday.moonset)}</span>
        </div>

        <LunarIllumination phase={lunarToday.moonPhase} />

        <div className="flex justify-between text-sm opacity-80 mt-1">
          <span>Tomorrow</span>
          <span>{formatTime(lunarTomorrow?.moonrise ?? null)}</span>
        </div>
      </div>
    </div>
  );
}
