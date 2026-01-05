"use client";

import { MoonriseCountdown } from "./countdown";
import { MoonsetCountdown } from "./countdown";

type LunarEventsCardProps = {
  locationName: string;
  timezone: string;
  moonrise: string | null;
  moonset: string | null;
  moonPhaseName: string;
  moonPhaseEmoji: string;
  fetchedAt: string;
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
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-800 border border-white/10 shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-white">Lunar Events</h3>

      <p className="text-sm text-sky-300 mb-4">
        {locationName} • Updated{" "}
        {new Date(fetchedAt).toLocaleTimeString()}
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
            ? new Date(moonrise).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "—"}
        </div>

        {moonrise && (
          <MoonriseCountdown moonrise={moonrise} timezone={timezone} />
        )}
      </div>

      {/* Moonset */}
      <div className="mb-3">
        <div className="text-white text-sm mb-1">
          🌘 Moonset:{" "}
          {moonset
            ? new Date(moonset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "—"}
        </div>

        {moonset && (
          <MoonsetCountdown moonset={moonset} timezone={timezone} />
        )}
      </div>
    </div>
  );
}
