"use client";
// app\components\SolarArcBar.tsx

import { format } from "date-fns";

export function SolarArcBar({
  events,
  currentTime,
}: {
  events: {
    sunriseStart: Date;
    sunriseEnd: Date;
    solarNoon: Date;
    sunsetStart: Date;
    sunsetEnd: Date;
    sunset: Date;
  };
  currentTime: Date;
}) {
  const totalSpan = events.sunset.getTime() - events.sunriseStart.getTime();

  const position =
    ((currentTime.getTime() - events.sunriseStart.getTime()) / totalSpan) * 100;

  return (
    <div className="relative h-24 w-full rounded-xl bg-gradient-to-r from-blue-900 via-gray-400 to-blue-900 shadow-inner">
      {/* Arc */}
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
      >
        <path
          d="M0,50 Q50,0 100,50"
          stroke="white"
          strokeWidth="0.5"
          fill="none"
        />
        <circle
          cx={position}
          cy={25 - Math.sin((position / 100) * Math.PI) * 25}
          r="1.5"
          fill="yellow"
          className="animate-pulse"
        />
      </svg>

      {/* Markers */}
      {Object.entries(events).map(([label, time]) => {
        const left =
          ((time.getTime() - events.sunriseStart.getTime()) / totalSpan) * 100;
        return (
          <div
            key={label}
            className="absolute top-0 h-full"
            style={{ left: `${left}%` }}
          >
            <div className="w-px h-full bg-white/60" />
            <div className="text-xs text-white absolute top-full mt-1 whitespace-nowrap">
              {label.replace(/([A-Z])/g, " $1")}
              <br />
              {format(time, "h:mm a")}
            </div>
          </div>
        );
      })}
    </div>
  );
}
