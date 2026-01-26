"use client";

import { useEffect, useState } from "react";

type EventPoint = {
  label: string;
  time: Date | null;
  color?: string;
};

type Range = {
  start: Date | null;
  end: Date | null;
  color: string;
  opacity?: number;
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
}: {
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
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const percentOfDay = (d: Date | null) => {
    if (!d) return 0;
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const diff = d.getTime() - start.getTime();
    return (diff / (24 * 60 * 60 * 1000)) * 100;
  };

  const events: EventPoint[] = [
    { label: "Sunrise", time: sunrise, color: "#f59e0b" },
    { label: "Sunset", time: sunset, color: "#f97316" },
    { label: "Moonrise", time: moonrise, color: "#6366f1" },
    { label: "Moonset", time: moonset, color: "#4f46e5" },
  ];

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
    <div className="w-full p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur">
      <h2 className="text-lg font-semibold mb-4">Astronomy Timeline</h2>

      <div className="relative w-full h-28 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg overflow-hidden">
        {/* Ranges */}
        {ranges.map((r, i) => {
          if (!r.start || !r.end) return null;
          const left = percentOfDay(r.start);
          const width = percentOfDay(r.end) - left;
          return (
            <div
              key={i}
              className="absolute top-0 h-full"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: r.color,
                opacity: r.opacity ?? 0.2,
              }}
            />
          );
        })}

        {/* Event ticks */}
        {events.map((e, i) => {
          if (!e.time) return null;
          return (
            <div
              key={i}
              className="absolute top-0 h-full flex flex-col items-center"
              style={{ left: `${percentOfDay(e.time)}%` }}
            >
              <div
                className="w-0.5 h-full"
                style={{ backgroundColor: e.color ?? "white" }}
              />
              <span className="text-xs mt-1 opacity-80">{e.label}</span>
            </div>
          );
        })}

        {/* Current time marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.8)]"
          style={{ left: `${percentOfDay(now)}%` }}
        />
      </div>
    </div>
  );
}
