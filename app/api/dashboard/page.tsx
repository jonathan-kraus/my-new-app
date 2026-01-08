// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { buildAstronomyEvents } from "@/lib/astronomy-ui";
import LiveTimeline from "@/components/LiveTimeline";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-300 text-lg">Loading your dashboard…</div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-red-400 text-lg">Failed to load dashboard.</div>
    );
  }

  const { weather, astronomy, systemHealth, recentActivity } = data;

  // Astronomy helpers
  const today = astronomy?.today ?? null;
  const tomorrow = astronomy?.tomorrow ?? null;

  let astro = null;
  if (today) {
    const { nextEvent, previousEvent, currentEvent, timeUntilNext, timeSincePrevious, events } = buildAstronomyEvents(today, tomorrow); astro = { nextEvent, previousEvent, currentEvent, timeUntilNext, timeSincePrevious, events, today, tomorrow, };
  }

  return (
    <div className="p-6 space-y-6">
      {/* Greeting */}
      <h1 className="text-3xl font-semibold text-white">
        Good evening, Jonathan.
      </h1>
      <p className="text-gray-400">
        Your dashboard is online and running smoothly.
      </p>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WEATHER CARD */}
        <div className="rounded-xl bg-white/5 p-5 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-3">
            Current Weather
          </h2>

          {weather ? (
            <div className="space-y-2 text-gray-300">
              <div className="text-4xl font-bold text-white">
                {weather.temperature}°
              </div>
              <div>Feels like: {weather.feelsLike}°</div>
              <div>Humidity: {weather.humidity}%</div>
              <div>Wind: {weather.windSpeed} mph</div>
              <div className="text-xs text-gray-500">
                Updated {weather.lastUpdated}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No weather data available.</div>
          )}
        </div>

        {/* ASTRONOMY CARD */}
        <div className="rounded-xl bg-white/5 p-5 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-3">Astronomy</h2>

          {!astro ? (
            <div className="text-gray-500">No astronomy data available.</div>
          ) : (
            <div className="space-y-4 text-gray-300">
              {/* Solar Timeline */}
              <div>
                <h3 className="text-white font-medium mb-1">Solar Timeline</h3>
                <div>🌅 Sunrise: {formatTime(astro.today.sunrise)}</div>
                <div>🌇 Sunset: {formatTime(astro.today.sunset)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Day Length:{" "}
                  {dayLength(astro.today.sunrise, astro.today.sunset)}
                </div>
              </div>

              {/* Lunar Timeline */}
              <div>
                <h3 className="text-white font-medium mb-1">Lunar Timeline</h3>
                {astro.today.moonrise || astro.today.moonset ? (
                  <>
                    {astro.today.moonrise && (
                      <div>🌙 Moonrise: {formatTime(astro.today.moonrise)}</div>
                    )}
                    {astro.today.moonset && (
                      <div>🌙 Moonset: {formatTime(astro.today.moonset)}</div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-500">No lunar data available.</div>
                )}
              </div>

              {/* Golden & Blue Hours */}
              <div>
                <h3 className="text-white font-medium mb-1">
                  Golden & Blue Hours
                </h3>

                <div>
                  Sunrise Blue Hour:{" "}
                  {formatRange(
                    astro.today.sunriseBlueStart,
                    astro.today.sunriseBlueEnd,
                  )}
                </div>
                <div>
                  Sunrise Golden Hour:{" "}
                  {formatRange(
                    astro.today.sunriseGoldenStart,
                    astro.today.sunriseGoldenEnd,
                  )}
                </div>
                <div>
                  Sunset Golden Hour:{" "}
                  {formatRange(
                    astro.today.sunsetGoldenStart,
                    astro.today.sunsetGoldenEnd,
                  )}
                </div>
                <div>
                  Sunset Blue Hour:{" "}
                  {formatRange(
                    astro.today.sunsetBlueStart,
                    astro.today.sunsetBlueEnd,
                  )}
                </div>
              </div>

              {/* Next Event */}
              {astro.nextEvent && (
                <div className="mt-4 p-3 rounded-lg bg-white/10 border border-white/10">
                  <div className="text-white font-medium">
                    Next Event: {astro.nextEvent.label}
                  </div>
                  <div className="text-gray-400 text-sm">
{astro.timeUntilNext ? countdown(astro.timeUntilNext) : "No upcoming events"}


                  </div>
                  <LiveTimeline today={astro.today} tomorrow={astro.tomorrow} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="rounded-xl bg-white/5 p-5 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-3">
            Recent Activity
          </h2>

          {recentActivity?.length ? (
            <ul className="space-y-2 text-gray-300">
              {recentActivity.map((item: any) => (
                <li
                  key={item.id}
                  className="p-2 rounded bg-white/5 border border-white/10"
                >
                  {item.message}
                  <div className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Helper functions
// -----------------------------
function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRange(start: string, end: string) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

function dayLength(sunrise: string, sunset: string) {
  const diff = new Date(sunset).getTime() - new Date(sunrise).getTime();
  const hours = diff / 1000 / 60 / 60;
  return `${hours.toFixed(2)} hours`;
}

function countdown(target: Date | number | null) {
  if (!target) return "—";

  const ms =
    target instanceof Date
      ? target.getTime() - Date.now()
      : target - Date.now();

  if (ms <= 0) return "Now";

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const h = hours % 24;
  const m = minutes % 60;

  if (days > 0) return `${days}d ${h}h ${m}m`;
  if (hours > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

