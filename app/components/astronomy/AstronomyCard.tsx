"use client";
// app/components/astronomy/AstronomyCard.tsx
import { SunriseCountdown, SunsetCountdown, } from "@/components/astronomy/countdown";
import { getMoonPhaseIcon, getMoonPhaseName } from "@/lib/astro/moonPhase";
import { AstronomyCardProps } from "@/lib/types";
export function AstronomyCard({ data, location }: AstronomyCardProps) {
  if (!data) return null;

  const format = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

  const now = new Date();
  const sunrise = data.sunrise ? new Date(data.sunrise) : null;
  const sunset = data.sunset ? new Date(data.sunset) : null;

  const nextEvent =
    sunrise && now < sunrise
      ? { type: "sunrise", time: sunrise }
      : sunset && now < sunset
      ? { type: "sunset", time: sunset }
      : null;

  const moonIcon = getMoonPhaseIcon(now);
  const moonName = getMoonPhaseName(now);

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-700 to-sky-800 border border-white/10 shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-white">Astronomy</h3>

      <p className="text-sm text-sky-200 mb-4">
        {location.name} • 📡 {data.source} • Updated{" "}
        {new Date(data.fetchedAt).toLocaleTimeString()}
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm text-white">
        <div>🌅 Sunrise: {format(data.sunrise)}</div>
        <div>🌇 Sunset: {format(data.sunset)}</div>
        <div>🌙 Moonrise: {format(data.moonrise)}</div>
        <div>🌘 Moonset: {format(data.moonset)}</div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-sky-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">{moonIcon}</span>
          <span>{moonName}</span>
        </div>

        {nextEvent?.type === "sunrise" && (
          <SunriseCountdown sunriseIso={data.sunrise!} locationName={location.name} />
        )}

        {nextEvent?.type === "sunset" && (
          <SunsetCountdown sunsetIso={data.sunset!} locationName={location.name} />
        )}
      </div>
    </div>
  );
}

