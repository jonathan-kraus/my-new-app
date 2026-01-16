"use client";

import { SunriseCountdown, SunsetCountdown } from "@/app/astronomy/countdown";
import { formatTime } from "@/lib/astronomy/formatTime";
import {
  getMoonPhaseIcon,
  getMoonPhaseName,
} from "@/lib/astronomy_old/moonPhase";
import { useNow } from "@/hooks/useNow";
import {
  getLightPhases,
  getMoonLightPhases,
} from "@/lib/astronomy_old/lightPhases";
import type { AstronomyCardProps } from "@/lib/types";

export function AstronomyCard({ data, location }: AstronomyCardProps) {
  const now = useNow();
  if (!data) return null;

  // Normalize ISO strings into Date objects
  const sunriseDate = data.sunrise ? new Date(data.sunrise) : null;
  const sunsetDate = data.sunset ? new Date(data.sunset) : null;

  const moonriseDate = data.moonrise ? new Date(data.moonrise) : null;
  const moonsetDate = data.moonset ? new Date(data.moonset) : null;

  // Determine next solar event
  const nextSolarEvent =
    sunriseDate && now < sunriseDate
      ? { type: "sunrise", time: sunriseDate }
      : sunsetDate && now < sunsetDate
        ? { type: "sunset", time: sunsetDate }
        : null;

  // Light phases
  const solarPhases =
    sunriseDate && sunsetDate ? getLightPhases(sunriseDate, sunsetDate) : null;

  const lunarPhases = getMoonLightPhases(moonriseDate, moonsetDate);

  const moonIcon = getMoonPhaseIcon(now);
  const moonName = getMoonPhaseName(now);

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-700 to-sky-800 border border-white/10 shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-white">Astronomy</h3>

      <p className="text-sm text-sky-200 mb-4">
        {location.name} • 📡 {data.source} •
      </p>

      {/* Rise/Set Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm text-white">
        <div>🌅 Sunrise: {formatTime(data.sunrise)}</div>
        <div>🌇 Sunset: {formatTime(data.sunset)}</div>
      </div>

      {/* Countdown */}
      <div className="mt-4 text-sm text-sky-200">
        {nextSolarEvent?.type === "sunrise" && (
          <SunriseCountdown
            sunrise={data.sunrise!}
            timezone={location.timezone}
          />
        )}
        {nextSolarEvent?.type === "sunset" && (
          <SunsetCountdown sunset={data.sunset!} timezone={location.timezone} />
        )}
      </div>

      {/* Light Phases */}
      {solarPhases && (
        <div className="mt-4 text-xs text-sky-300 space-y-1">
          <div>
            🌄 Sunrise Golden Hour:{" "}
            {formatTime(solarPhases.sunriseGoldenHour.start)} –{" "}
            {formatTime(solarPhases.sunriseGoldenHour.end)}
          </div>

          <div>
            🌆 Sunset Golden Hour:{" "}
            {formatTime(solarPhases.sunsetGoldenHour.start)} –{" "}
            {formatTime(solarPhases.sunsetGoldenHour.end)}
          </div>

          <div>
            🌌 Sunrise Blue Hour:{" "}
            {formatTime(solarPhases.sunriseBlueHour.start)} –{" "}
            {formatTime(solarPhases.sunriseBlueHour.end)}
          </div>

          <div>
            🌙 Sunset Blue Hour: {formatTime(solarPhases.sunsetBlueHour.start)}{" "}
            – {formatTime(solarPhases.sunsetBlueHour.end)}
          </div>
        </div>
      )}
    </div>
  );
}
