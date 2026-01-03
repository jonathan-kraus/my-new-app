"use client";

import { useEffect, useState } from "react";
import { LocationSelector } from "@/components/LocationSelector";
import { ForecastCard } from "./ForecastCard";
import { CurrentWeather } from "./CurrentWeather";
import { Location } from "@/lib/types";
function formatDayLabel(dateStr: string, index: number) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";

  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
  });
}

export default function ForecastClient({
  locations,
}: {
  locations: Location[];
}) {
  const [selectedId, setSelectedId] = useState(locations[0]?.id);
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    if (!selectedId) return;

    fetch(`/api/weather/forecast?locationId=${selectedId}`)
      .then((r) => r.json())
      .then(setForecast);
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600 px-6 py-10">
      <div className="max-w-5xl mx-auto text-white">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black drop-shadow">Forecast</h1>

          <LocationSelector
            locations={locations}
            selectedId={selectedId}
            onChange={setSelectedId}
          />
        </div>

        {forecast && (
          <>
            <p className="mb-4 text-lg opacity-90">{forecast.location.name}</p>
              <CurrentWeather temperature={forecast.current.temperature}
               windspeed={forecast.current.windspeed} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {forecast.forecast.temperature_2m_max.map(
                (high: number, i: number) => (
                  <ForecastCard
                    key={i}
                    day={formatDayLabel(forecast.forecast.time[i], i)}
                    icon="🌤️"
                    high={Math.round(high)}
                    low={Math.round(forecast.forecast.temperature_2m_min[i])}
                    description="Forecast"
                  />
                ),
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
