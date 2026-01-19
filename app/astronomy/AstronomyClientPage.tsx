"use client";

import { UnifiedNextAstronomicalEventCard } from "./UnifiedNextAstronomicalEventCard";
import { CombinedSolarLunarTimeline } from "./CombinedSolarLunarTimeline";
import { SolarCard } from "./SolarCard";
import { LunarCard } from "./LunarCard";

import { useSolarCountdown } from "@/hooks/useSolarCountdown";
import { useLunarCountdown } from "@/hooks/useLunarCountdown";

import { parseLocalTimestamp, parseLocalTimestampTomorrow } from "@/lib/time";

export function AstronomyClientPage({ data }: { data: any }) {
  // Parse solar timestamps
  const solarToday = {
    sunrise: parseLocalTimestamp(data.today.sunrise),
    sunset: parseLocalTimestamp(data.today.sunset),
    sunriseBlueStart: parseLocalTimestamp(data.today.sunriseBlueStart),
    sunriseBlueEnd: parseLocalTimestamp(data.today.sunriseBlueEnd),
    sunriseGoldenStart: parseLocalTimestamp(data.today.sunriseGoldenStart),
    sunriseGoldenEnd: parseLocalTimestamp(data.today.sunriseGoldenEnd),
    sunsetGoldenStart: parseLocalTimestamp(data.today.sunsetGoldenStart),
    sunsetGoldenEnd: parseLocalTimestamp(data.today.sunsetGoldenEnd),
    sunsetBlueStart: parseLocalTimestamp(data.today.sunsetBlueStart),
    sunsetBlueEnd: parseLocalTimestamp(data.today.sunsetBlueEnd),
  };

  const solarTomorrow = {
    sunrise: parseLocalTimestampTomorrow(data.tomorrow.sunrise),
    sunset: parseLocalTimestampTomorrow(data.tomorrow.sunset),
  };

  const solar = useSolarCountdown(solarToday, solarTomorrow);

  // Parse lunar timestamps
  const lunarToday = {
    moonrise: parseLocalTimestamp(data.today.moonrise),
    moonset: parseLocalTimestamp(data.today.moonset),
    moonPhase: data.today.moonPhase,
  };

  const lunarTomorrow = {
    moonrise: parseLocalTimestampTomorrow(data.tomorrow.moonrise),
    moonset: parseLocalTimestampTomorrow(data.tomorrow.moonset),
  };

  const lunar = useLunarCountdown(lunarToday, lunarTomorrow);

  return (
    <div className="space-y-10">
      <UnifiedNextAstronomicalEventCard
        solarToday={solarToday}
        solarTomorrow={solarTomorrow}
        lunarToday={lunarToday}
        lunarTomorrow={lunarTomorrow}
      />

      <CombinedSolarLunarTimeline
        solarToday={data.today}
        solarTomorrow={data.tomorrow}
        lunarToday={data.today}
        lunarTomorrow={data.tomorrow}
      />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SolarCard today={solarToday} tomorrow={solarTomorrow} />
        <LunarCard today={lunarToday} tomorrow={lunarTomorrow} lunar={lunar} />
      </section>
    </div>
  );
}
