// app/astronomy/UnifiedNextAstronomicalEventCard.tsx

import { formatCountdown } from "@/lib/time";
import { getUnifiedNextEvent } from "@/lib/astronomy/nextAstronomicalEvent";
import { useSolarCountdown } from "@/hooks/useSolarCountdown";
import { useLunarCountdown } from "@/hooks/useLunarCountdown";
import { formatTime } from "@/lib/astronomy/formatTime";

export function UnifiedNextAstronomicalEventCard({
  solarToday,
  solarTomorrow,
  lunarToday,
  lunarTomorrow,
}: any) {
  const solar = useSolarCountdown(solarToday, solarTomorrow);
  const lunar = useLunarCountdown(lunarToday, lunarTomorrow);

  const unified = getUnifiedNextEvent(solar, lunar);

  if (!unified) {
    return (
      <div className="p-4 rounded-lg bg-gray-900/20 border border-gray-700/30">
        <h2 className="text-lg font-semibold">Next Astronomical Event</h2>
        <p>No upcoming events</p>
      </div>
    );
  }

  const { type, event, time, ms } = unified;

  const label = type === "solar" ? `☀️ Solar: ${event}` : `🌙 Lunar: ${event}`;

  return (
    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-700/30">
      <h2 className="text-lg font-semibold">Next Astronomical Event</h2>

      <p className="mt-1">{label}</p>
      <p className="text-sm text-gray-300">{formatTime(time)}</p>

      <p className="mt-2 font-medium">In {formatCountdown(ms)}</p>
    </div>
  );
}
