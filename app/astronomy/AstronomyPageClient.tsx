"use client";

import { useAstronomy } from "@/hooks/useAstronomy";
import { SolarCard } from "./SolarCard";
import { LunarCard } from "./LunarCard";
import { GoldenHourCard } from "./GoldenHourCard";
import { CombinedSolarLunarTimeline } from "./CombinedSolarLunarTimeline";
import { SkyStateCard } from "./SkyStateCard";

export default function AstronomyPage({ snapshots }: { snapshots: any[] }) {
  const { today, tomorrow, solar, lunar } = useAstronomy(snapshots);
  console.log("ASTRONOMY PAGE LOADED");

  if (!today || !solar || !lunar) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1f] to-[#1a2238] text-white">
        <h2 className="text-xl font-semibold">Astronomy</h2>
        <p className="opacity-80 mt-2">No astronomy data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#1f2937] p-4 shadow-lg border border-white/10">
      <h1 className="text-2xl font-bold">Astronomy Dashboard</h1>

      {/* Solar */}
      <SolarCard today={solar} tomorrow={tomorrow?.solar ?? null} />

      {/* Lunar */}
      <LunarCard today={lunar} tomorrow={tomorrow?.lunar ?? null} />

      {/* Golden Hour */}
      <GoldenHourCard
        sunriseBlueStart={solar.sunriseBlueStart}
        sunriseBlueEnd={solar.sunriseBlueEnd}
        sunriseGoldenStart={solar.sunriseGoldenStart}
        sunriseGoldenEnd={solar.sunriseGoldenEnd}
        sunsetGoldenStart={solar.sunsetGoldenStart}
        sunsetGoldenEnd={solar.sunsetGoldenEnd}
        sunsetBlueStart={solar.sunsetBlueStart}
        sunsetBlueEnd={solar.sunsetBlueEnd}
      />

      {/* Combined Timeline */}
      <CombinedSolarLunarTimeline
        solarToday={solar}
        solarTomorrow={tomorrow?.solar ?? null}
        lunarToday={lunar}
        lunarTomorrow={tomorrow?.lunar ?? null}
      />

      {/* Sky State */}
      <SkyStateCard solar={solar} />
    </div>
  );
}
