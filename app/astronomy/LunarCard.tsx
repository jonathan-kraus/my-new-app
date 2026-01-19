// app/astronomy/LunarCard.tsx

import { formatCountdown } from "@/lib/time";

export function LunarCard({ today, tomorrow, lunar }: any) {
  const { moonrise, moonset, moonPhase } = today;
  const nextEvent = lunar?.nextEvent ?? null;
  const nextTime = lunar?.nextTime ?? null;
  const nextCountdown = lunar ? formatCountdown(lunar.ms) : "—";

  return (
    <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700/30">
      <h2 className="text-lg font-semibold">Lunar</h2>

      <p>🌙 Moonrise: {moonrise ? moonrise.toLocaleTimeString() : "—"}</p>
      <p>🌘 Moonset: {moonset ? moonset.toLocaleTimeString() : "—"}</p>
      <p>🌗 Phase: {moonPhase}</p>

      {nextEvent && nextTime && (
        <p className="mt-2">
          Next: {nextEvent} in {nextCountdown}
        </p>
      )}
    </div>
  );
}
