"use client";

import { useLunarCountdown } from "@/hooks/useLunarCountdown";

export function LunarEventsCard({ today, tomorrow }: any) {
  const {
    nextEventLabel,
    nextCountdown,
    isVisible,
    moonrise,
    moonset,
  } = useLunarCountdown({ today, tomorrow });

  return (
    <div className="rounded-xl border bg-black/20 p-4 text-white shadow-lg backdrop-blur">
      <h2 className="text-lg font-semibold mb-2">Lunar Events</h2>

      <div className="text-sm opacity-80 mb-1">
        Next Event: <span className="font-medium">{nextEventLabel}</span>
      </div>

      <div className="text-2xl font-bold mb-3">
        {nextCountdown.hours}h {nextCountdown.minutes}m {nextCountdown.seconds}s
      </div>

      <div className="text-xs opacity-70">
        {isVisible
          ? "🌕 The Moon is currently visible"
          : "🌑 The Moon is below the horizon"}
      </div>

      <div className="mt-3 text-xs opacity-60">
        <div>Moonrise: {moonrise ? moonrise.toLocaleTimeString() : "—"}</div>
        <div>Moonset: {moonset ? moonset.toLocaleTimeString() : "—"}</div>
      </div>
    </div>
  );
}
