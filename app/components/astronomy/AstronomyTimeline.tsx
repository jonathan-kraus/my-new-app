"use client";

import { useEffect, useState } from "react";

type Props = {
  sunrise: Date | null;
  sunset: Date | null;

  moonrise: Date | null;
  moonset: Date | null;

  sunriseBlueStart: Date | null;
  sunriseBlueEnd: Date | null;

  sunriseGoldenStart: Date | null;
  sunriseGoldenEnd: Date | null;

  sunsetBlueStart: Date | null;
  sunsetBlueEnd: Date | null;

  sunsetGoldenStart: Date | null;
  sunsetGoldenEnd: Date | null;
};

type Range = {
  start: Date | null;
  end: Date | null;
  color: string;
  opacity: number;
};

export function AstronomyTimeline({
  sunrise,
  sunset,
  moonrise,
  moonset,

  sunriseBlueStart,
  sunriseBlueEnd,
  sunriseGoldenStart,
  sunriseGoldenEnd,

  sunsetBlueStart,
  sunsetBlueEnd,
  sunsetGoldenStart,
  sunsetGoldenEnd,
}: Props) {
  const [now, setNow] = useState(new Date());

  // Live update every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Normalize day boundaries
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const pct = (d: Date | null) => {
    if (!d) return null;
    return (
      ((d.getTime() - startOfDay.getTime()) /
        (endOfDay.getTime() - startOfDay.getTime())) *
      100
    );
  };

  const nowPct = pct(now);

  // All golden/blue hour windows
  const ranges: Range[] = [
    // Sunrise Golden Hour
    {
      start: sunriseGoldenStart,
      end: sunriseGoldenEnd,
      color: "#fbbf24",
      opacity: 0.25,
    },
    // Sunrise Blue Hour
    {
      start: sunriseBlueStart,
      end: sunriseBlueEnd,
      color: "#93c5fd",
      opacity: 0.25,
    },
    // Sunset Golden Hour
    {
      start: sunsetGoldenStart,
      end: sunsetGoldenEnd,
      color: "#fbbf24",
      opacity: 0.25,
    },
    // Sunset Blue Hour
    {
      start: sunsetBlueStart,
      end: sunsetBlueEnd,
      color: "#93c5fd",
      opacity: 0.25,
    },
  ];

  return (
    <div className="relative w-full h-24 bg-white/5 rounded-xl border border-white/10 backdrop-blur overflow-hidden">
      <div className="relative w-full h-24 bg-white/5 rounded-xl border border-white/10 backdrop-blur overflow-hidden">
        {/* Twilight Gradient Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
        linear-gradient(
          to right,
          #0b1b3a 0%,
          #0b1b3a 10%,
          #1e3a8a 15%,
          #1e3a8a 20%,
          #f59e0b 25%,
          #f59e0b 30%,
          #fef3c7 40%,
          #fef3c7 60%,
          #f59e0b 70%,
          #f59e0b 75%,
          #1e3a8a 80%,
          #1e3a8a 85%,
          #0b1b3a 100%
        )
      `,
            opacity: 0.35,
          }}
        />

        {/* Mini Solar Arc */}
        <svg
          className="absolute -top-10 left-0 right-0 h-10 w-full pointer-events-none"
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
        >
          <path
            d="M0 20 Q50 0 100 20"
            stroke="#fbbf24"
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
        </svg>

        {/* ...your existing ranges + markers + now line... */}

        {/* Golden + Blue Hour Ranges */}
        {ranges.map((r, i) => {
          const left = pct(r.start);
          const right = pct(r.end);
          if (left === null || right === null) return null;

          return (
            <div
              key={i}
              className="absolute top-0 bottom-0"
              style={{
                left: `${left}%`,
                width: `${right - left}%`,
                backgroundColor: r.color,
                opacity: r.opacity,
              }}
            />
          );
        })}

        {/* Sunrise */}
        {sunrise && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-orange-400"
            style={{ left: `${pct(sunrise)}%` }}
          />
        )}

        {/* Sunset */}
        {sunset && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-orange-400"
            style={{ left: `${pct(sunset)}%` }}
          />
        )}

        {/* Moonrise */}
        {moonrise && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-indigo-300"
            style={{ left: `${pct(moonrise)}%` }}
          />
        )}

        {/* Moonset */}
        {moonset && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-indigo-300"
            style={{ left: `${pct(moonset)}%` }}
          />
        )}

        {/* Now Marker */}
        {nowPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-400"
            style={{ left: `${nowPct}%` }}
          />
        )}
      </div>
    </div>
  );
}
