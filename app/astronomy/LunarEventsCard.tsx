"use client";

import { useEffect, useState } from "react";
import { MoonriseCountdown, MoonsetCountdown } from "@/app/astronomy/countdown";


type LunarEventsCardProps = {
  locationName: string;
  timezone: string;
  moonrise: string | null;
  moonset: string | null;
  moonPhaseName: string;
  moonPhaseEmoji: string;
  fetchedAt: string | null;
};

export default function LunarEventsCard({
  locationName,
  timezone,
  moonrise,
  moonset,
  moonPhaseName,
  moonPhaseEmoji,
  fetchedAt,
}: LunarEventsCardProps) {
  // Prevent hydration mismatch
  const [isReady, setIsReady] = useState(false);
  useEffect(() => setIsReady(true), []);

  if (!isReady) return null;

  const now = Date.now();

  const riseTime = moonrise ? new Date(moonrise).getTime() : null;
  const setTime = moonset ? new Date(moonset).getTime() : null;

  // Determine next lunar event
  let nextEvent: { type: "moonrise" | "moonset"; time: string } | null = null;

  if (riseTime && riseTime > now) {
    nextEvent = { type: "moonrise", time: moonrise! };
  } else if (setTime && setTime > now) {
    nextEvent = { type: "moonset", time: moonset! };
  }

  const formattedFetched =
    fetchedAt && !isNaN(new Date(fetchedAt).getTime())
      ? new Date(fetchedAt).toLocaleTimeString()
      : "—";

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-800 border border-white/10 shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-white">Lunar Events</h3>

      <p className="text-sm text-sky-300 mb-4">
        {locationName} • Updated {formattedFetched}
      </p>

      {/* Moon Phase */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{moonPhaseEmoji}</span>
        <span className="text-sky-200 text-sm">{moonPhaseName}</span>
      </div>

      {/* Moonrise */}
      <div className="mb-3">
        <div className="text-white text-sm mb-1">
          🌕 Moonrise:{" "}
          {moonrise
            ? new Date(moonrise).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </div>

        {nextEvent?.type === "moonrise" && (
          <MoonriseCountdown moonrise={nextEvent.time} timezone={timezone} />
        )}
      </div>

      {/* Moonset */}
      <div className="mb-3">
        <div className="text-white text-sm mb-1">
          🌘 Moonset:{" "}
          {moonset
            ? new Date(moonset).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </div>

        {nextEvent?.type === "moonset" && (
          <MoonsetCountdown moonset={nextEvent.time} timezone={timezone} />
        )}
      </div>
    </div>
  );
}
