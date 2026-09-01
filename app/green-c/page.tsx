/*
 * @FilePath: \my-new-app\app\green-c\page.tsx
 * @LastEditTime: 2026-08-26 01:18:22
 */
"use client";

import { useState } from "react";
import useSWR from "swr";
import { greenCStops } from "@/lib/mbta/stops";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getCountdown(arrival: string | null): string {
  if (!arrival) return "—";

  const arrivalDate = new Date(arrival).getTime();
  const now = Date.now();
  const diffMs = arrivalDate - now;

  if (diffMs <= 0) return "Arriving now";

  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin === 0) return "Less than 1 min";
  if (diffMin === 1) return "1 min";

  return `${diffMin} min`;
}

function getTrip(prediction: MBTAPrediction, included: any[]) {
  return (
    included?.find(
      (i) =>
        i.type === "trip" && i.id === prediction.relationships.trip?.data?.id,
    ) || null
  );
}

function getHeadsign(prediction: MBTAPrediction, included: any[]) {
  const trip = getTrip(prediction, included);
  return trip?.attributes?.headsign || trip?.attributes?.destination || null;
}

function getDirectionLabel(dir: number) {
  return dir === 0 ? "Outbound" : "Inbound";
}
export const routeColors: Record<string, string> = {
  "Green-B": "bg-yellow-600",
  "Green-C": "bg-green-600",
  "Green-D": "bg-green-700",
  "Green-E": "bg-teal-600",
};
export function RouteBadge({ route }: { route: string }) {
  const color = routeColors[route] ?? "bg-gray-600";

  return (
    <span className={`px-2 py-1 rounded text-sm font-semibold ${color}`}>
      {route}
    </span>
  );
}

export default function GreenCPage() {
  const [stopId, setStopId] = useState<string>("place-denrd");

  const { data, isLoading } = useSWR<{
    data: MBTAPrediction[];
    included: any[];
  }>(`/api/arrivals/${stopId}?include=trip,route`, fetcher, {
    refreshInterval: 15000,
  });

  const predictions = data?.data ?? [];
  const included = data?.included ?? [];

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Train Arrivals</h1>

      {/* Stop Selector */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Choose a stop:</label>
        <select
          value={stopId}
          onChange={(e) => setStopId(e.target.value)}
          className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-900 w-full"
        >
          {greenCStops.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.attributes.name}
            </option>
          ))}
        </select>
      </div>

      {/* Unified layout */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <p>Loading…</p>
        ) : predictions.length === 0 ? (
          <p>No trains predicted.</p>
        ) : (
          predictions.map((p) => {
            const route = p.relationships.route?.data?.id ?? "Unknown";
            const headsign = getHeadsign(p, included);
            const direction = getDirectionLabel(p.attributes.direction_id);
            const vehicle = p.relationships.vehicle?.data?.id ?? "Unknown";

            return (
              <div key={p.id} className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">
                  {direction}
                  {headsign && ` — ${headsign}`}
                </h2>

                <p>
                  <RouteBadge route={route} />
                </p>

                <p>
                  <strong>Arrives:</strong>{" "}
                  {getCountdown(p.attributes.arrival_time)}
                </p>

                <p>
                  {p.attributes.arrival_time
                    ? new Date(p.attributes.arrival_time).toLocaleTimeString()
                    : "—"}
                </p>

                <p>
                  <strong>Vehicle:</strong> {vehicle}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

type MBTAPrediction = {
  id: string;
  attributes: {
    arrival_time: string | null;
    departure_time: string | null;
    direction_id: number;
    stop_sequence: number;
    status: string | null;
  };
  relationships: {
    route: { data: { id: string } };
    stop: { data: { id: string } };
    trip: { data: { id: string } };
    vehicle?: { data?: { id: string } };
  };
};
