"use client";
import { UnifiedNextAstronomicalEventCard } from "./UnifiedNextAstronomicalEventCard";
import { CombinedSolarLunarTimeline } from "./CombinedSolarLunarTimeline";
import { SolarCard } from "./SolarCard";
import { LunarCard } from "./LunarCard";
import { useLunarCountdown } from "@/hooks/useLunarCountdown";
import { parseLocalTimestamp, parseLocalTimestampTomorrow } from "@/lib/time";
export function AstronomyClientPage({ data }: { data: any }) {
  const solar = {
    today: data.today,
    tomorrow: data.tomorrow,
  };

  const lunar = useLunarCountdown(data.today, data.tomorrow);

  return (
    <div className="space-y-10">
      <UnifiedNextAstronomicalEventCard
        solarToday={solar.today}
        solarTomorrow={solar.tomorrow}
        lunarToday={data.today}
        lunarTomorrow={data.tomorrow}
      />

      <CombinedSolarLunarTimeline
        solarToday={solar.today}
        solarTomorrow={solar.tomorrow}
        lunarToday={data.today}
        lunarTomorrow={data.tomorrow}
      />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SolarCard today={solar.today} tomorrow={solar.tomorrow} />
        const lunarCountdown = useLunarCountdown(data.today, data.tomorrow);
        <LunarCard
          today={{
            moonrise: parseLocalTimestamp(data.today.moonrise),
            moonset: parseLocalTimestamp(data.today.moonset),
            moonPhase: data.today.moonPhase,
          }}
          tomorrow={{
            moonrise: parseLocalTimestampTomorrow(data.tomorrow.moonrise),
            moonset: parseLocalTimestampTomorrow(data.tomorrow.moonset),
          }}
          lunar={useLunarCountdown}
        />
      </section>
    </div>
  );
}
