"use client";

import { useEffect, useState } from "react";

type SolarCardProps = {
  today: any;
  nextSolar: { type: string; date: Date } | null;
};

export function SolarCard({ today, nextSolar }: SolarCardProps) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!today) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-gray-400 text-sm">No solar data for today.</p>
      </div>
    );
  }

  const sunrise = today.sunrise ? new Date(today.sunrise) : null;
  const sunset = today.sunset ? new Date(today.sunset) : null;

  const dayProgress = computeDayProgress(now, sunrise, sunset);
  const countdown = nextSolar ? formatCountdown(nextSolar.date, now) : null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-yellow-200">Solar</h2>

      <div className="flex justify-between text-sm text-gray-300">
        <div>
          <div className="font-semibold text-yellow-300">Sunrise</div>
          <div>{sunrise ? sunrise.toLocaleTimeString() : "—"}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-orange-300">Sunset</div>
          <div>{sunset ? sunset.toLocaleTimeString() : "—"}</div>
        </div>
      </div>

      {/* Arc indicator */}
      <div className="flex flex-col items-center space-y-2">
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500"
            style={{ width: `${Math.max(0, Math.min(100, dayProgress))}%` }}
          />
        </div>
        <div className="text-xs text-gray-400">
          {Number.isFinite(dayProgress)
            ? `${dayProgress.toFixed(0)}% through daylight`
            : "Outside daylight window"}
        </div>
      </div>

      {/* Next solar event */}
      <div className="border-t border-gray-800 pt-3 text-sm text-gray-300">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-blue-200">Next solar event</span>
          {nextSolar && (
            <span className="text-xs text-gray-400">
              {nextSolar.date.toLocaleTimeString()}
            </span>
          )}
        </div>

        {nextSolar ? (
          <>
            <div className="mt-1 capitalize">{prettyEventLabel(nextSolar.type)}</div>
            {countdown && (
              <div className="text-xs text-gray-400 mt-1">
                {countdown} remaining
              </div>
            )}
          </>
        ) : (
          <div className="mt-1 text-gray-500 text-xs">No upcoming solar events.</div>
        )}
      </div>
    </div>
  );
}

function computeDayProgress(now: Date, sunrise: Date | null, sunset: Date | null) {
  if (!sunrise || !sunset) return NaN;
  if (now <= sunrise) return 0;
  if (now >= sunset) return 100;

  const total = sunset.getTime() - sunrise.getTime();
  const elapsed = now.getTime() - sunrise.getTime();
  return (elapsed / total) * 100;
}

function formatCountdown(target: Date, now: Date) {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "now";

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function prettyEventLabel(type: string) {
  switch (type) {
    case "sunrise":
      return "Sunrise";
    case "sunset":
      return "Sunset";
    case "sunriseBlueStart":
      return "Blue hour begins (morning)";
    case "sunriseBlueEnd":
      return "Blue hour ends (morning)";
    case "sunriseGoldenStart":
      return "Golden hour begins (morning)";
    case "sunriseGoldenEnd":
      return "Golden hour ends (morning)";
    case "sunsetGoldenStart":
      return "Golden hour begins (evening)";
    case "sunsetGoldenEnd":
      return "Golden hour ends (evening)";
    case "sunsetBlueStart":
      return "Blue hour begins (evening)";
    case "sunsetBlueEnd":
      return "Blue hour ends (evening)";
    default:
      return type;
  }
}
