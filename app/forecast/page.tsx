"use client";

import { useEffect, useState } from "react";
import { LocationSelector } from "@/components/LocationSelector";
import { ForecastCard } from "./ForecastCard";
import { Location } from "@/lib/types";

export default function ForecastPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((data) => {
        setLocations(data);
        setSelectedId(data[0]?.id);
      });
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    fetch(`/api/weather/forecast?locationId=${selectedId}`)
      .then((r) => r.json())
      .then(setForecast);
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 px-6 py-10">
      <div className="max-w-5xl mx-auto text-white">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black drop-shadow">
            Forecast
          </h1>

          {locations.length > 0 && selectedId && (
            <LocationSelector
              locations={locations}
              selectedId={selectedId}
              onChange={setSelectedId}
            />
          )}
        </div>

        {forecast && (
          <>
            <p className="mb-4 text-lg opacity-90">
              {forecast.location.name}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {forecast.forecast.temperature_2m_max.map(
                (high: number, i: number) => (
                  <ForecastCard
                    key={i}
                    day={forecast.forecast.time[i]}
                    icon="🌤️"
                    high={Math.round(high)}
                    low={Math.round(
                      forecast.forecast.temperature_2m_min[i]
                    )}
                    description="Forecast"
                  />
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
