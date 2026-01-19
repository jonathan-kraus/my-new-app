// app/astronomy/LunarEventsCard.tsx

import { formatCountdown } from "@/lib/time";
import { useLunarCountdown } from "@/hooks/useLunarCountdown";
import { formatTime } from "@/lib/astronomy/formatTime";

export function LunarEventsCard({ today, tomorrow }: any) {
  const lunar = useLunarCountdown(today, tomorrow);

  const { moonrise, moonset, moonPhase } = today;

  const nextEvent = lunar?.nextEvent ?? null;
  const nextTime = lunar?.nextTime ?? null;
  const nextCountdown = lunar ? formatCountdown(lunar.ms) : "—";

  return (
    <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700/30">
      <h2 className="text-lg font-semibold">Lunar Events</h2>

      <p>🌙 Moonrise: {moonrise ? formatTime(moonrise) : "—"}</p>
      <p>🌘 Moonset: {moonset ? formatTime(moonset) : "—"}</p>
      <p>🌗 Phase: {moonPhase}</p>

      {nextEvent && nextTime && (
        <p className="mt-2">
          Next: {nextEvent} in {nextCountdown}
        </p>
      )}
    </div>
  );
}
