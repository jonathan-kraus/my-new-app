"use client";

import { useLunarCountdown } from "@/hooks/useLunarCountdown";

export function LunarCard({ today, tomorrow }: any) {
  const {
    moonrise,
    moonset,
    nextEventLabel,
    nextCountdown,
    isVisible,
    progressPercent,
  } = useLunarCountdown({ today, tomorrow });

  return (
    <div className="rounded-xl border bg-black/20 p-4 text-white shadow-lg backdrop-blur">
      <h2 className="text-lg font-semibold mb-3">Lunar Timeline</h2>

      <div className="flex justify-between text-sm opacity-80 mb-2">
        <span>Moonrise</span>
        <span>{moonrise ? moonrise.toLocaleTimeString() : "—"}</span>
      </div>

      <div className="flex justify-between text-sm opacity-80 mb-2">
        <span>Moonset</span>
        <span>{moonset ? moonset.toLocaleTimeString() : "—"}</span>
      </div>

      <div className="mt-4">
        <div className="text-xs opacity-70 mb-1">Visibility Progress</div>

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="text-xs opacity-60 mt-2">
          {isVisible
            ? "The Moon is currently above the horizon"
            : "The Moon is below the horizon"}
        </div>
      </div>

      <div className="mt-4 text-sm opacity-80">
        Next Event: <span className="font-medium">{nextEventLabel}</span>
      </div>

      <div className="text-xl font-bold mt-1">
        {nextCountdown.hours}h {nextCountdown.minutes}m {nextCountdown.seconds}s
      </div>
    </div>
  );
}
