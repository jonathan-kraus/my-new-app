import { UnifiedNextAstronomicalEventCard } from "./UnifiedNextAstronomicalEventCard";
import { CombinedSolarLunarTimeline } from "./CombinedSolarLunarTimeline";
import { SolarCard } from "./SolarCard";
import { LunarCard } from "./LunarCard";

export function AstronomyClientPage({ data }: { data: any }) {
  const solar = {
    today: data.today,
    tomorrow: data.tomorrow,
  };

  const lunar = {
    today: data.today,
    tomorrow: data.tomorrow,
  };

  return (
    <div className="space-y-10">
      <UnifiedNextAstronomicalEventCard
        solarToday={solar.today}
        solarTomorrow={solar.tomorrow}
        lunarToday={lunar.today}
        lunarTomorrow={lunar.tomorrow}
      />

      <CombinedSolarLunarTimeline
        solarToday={solar.today}
        solarTomorrow={solar.tomorrow}
        lunarToday={lunar.today}
        lunarTomorrow={lunar.tomorrow}
      />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SolarCard today={solar.today} tomorrow={solar.tomorrow} />
        <LunarCard today={lunar.today} tomorrow={lunar.tomorrow} />
      </section>
    </div>
  );
}
