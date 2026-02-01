"use client";

import { useNow } from "@/hooks/useNow";
import { Countdown } from "@/app/components/Countdown";
type AstronomyCardProps = {
  data: any | null;
};

export function AstronomyCard({ data }: AstronomyCardProps) {
  const now = useNow();

  if (!data) {
    return (
      <div className="p-4 bg-red-900/20 text-red-300 rounded">
        No astronomy data available
      </div>
    );
  }

  const { solar, lunar, nextEvent } = data;

  const safeTime = (ts: string | null | undefined) =>
    ts ? new Date(ts).toLocaleTimeString() : "—";

  const countdownTo = (ts: string | null | undefined) => {
    if (!ts) return "—";
    const target = new Date(ts).getTime();
    const diff = target - now.getTime();
    if (diff <= 0) return "—";

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const moonPhaseIcon = (illum: number | null) => {
    if (illum === null) return "○";
    if (illum < 0.1) return "🌑";
    if (illum < 0.25) return "🌒";
    if (illum < 0.4) return "🌓";
    if (illum < 0.6) return "🌔";
    if (illum < 0.75) return "🌕";
    if (illum < 0.9) return "🌖";
    return "🌕";
  };
  let sinceSunrise: string | null = null;
  const sunrise = solar.sunrise.timestamp;
  const sunset = solar.sunset.timestamp;
  if (now < sunrise) {
    // Before sunrise
    sinceSunrise = null; // or "Until Sunrise: ..."
  } else if (now >= sunrise && now <= sunset) {
    // Daylight
    const diffMs = now.getTime() - sunrise.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    sinceSunrise = `${hours}h ${minutes}m`;
  } else {
    // After sunset
    sinceSunrise = null; // or "Since Sunset: ..."
  }

  const events = [
    {
      label: "Sunrise",
      ts: solar?.sunrise?.timestamp,
    },
    {
      label: "Sunset",
      ts: solar?.sunset?.timestamp,
    },
    {
      label: "Moonrise",
      ts: lunar?.moonrise?.timestamp,
    },
    {
      label: "Moonset",
      ts: lunar?.moonset?.timestamp,
    },
  ].filter((e) => e.ts);

  return (
    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-700/30">
      <h2 className="text-lg font-semibold mb-4">Astronomy</h2>

      {/* Next Event */}
      <div className="mb-6">
        <p className="font-medium">Next Event</p>
        <p className="text-sm text-gray-300">{nextEvent?.name ?? "—"}</p>
        <p className="text-sm text-gray-300">
          {safeTime(nextEvent?.timestamp)}
        </p>
        <p className="text-sm text-gray-300">
          Countdown: <Countdown timestamp={nextEvent?.timestamp} />
        </p>
      </div>

      {/* Solar */}
      <div className="mb-6">
        <p className="font-medium">Solar</p>
        <p className="text-sm text-gray-300">
          Sunrise: {safeTime(solar?.sunrise?.timestamp)}
        </p>
        <p className="text-sm text-gray-300">
          Sunset: {safeTime(solar?.sunset?.timestamp)}
        </p>
        {sinceSunrise && (
          <p className="text-sm text-gray-300">Since Sunrise: {sinceSunrise}</p>
        )}
      </div>

      {/* Lunar */}
      <div className="mb-6">
        <p className="font-medium">Lunar</p>
        <p className="text-sm text-gray-300">
          Moonrise: {safeTime(lunar?.moonrise?.timestamp)}
        </p>
        <p className="text-sm text-gray-300">
          Moonset: {safeTime(lunar?.moonset?.timestamp)}
        </p>
        <p className="text-sm text-gray-300">
          Illumination:{" "}
          {lunar?.illumination !== null
            ? `${Math.round(lunar.illumination)}%`
            : "—"}
        </p>
        <p className="text-2xl mt-1">{moonPhaseIcon(lunar?.illumination)}</p>
      </div>

      {/* Timeline */}
      <div>
        <p className="font-medium mb-2">Event Timeline</p>
        {events.map((e) => (
          <div key={e.label} className="text-sm text-gray-300">
            {e.label}: {safeTime(e.ts)}
          </div>
        ))}
      </div>
    </div>
  );
}
