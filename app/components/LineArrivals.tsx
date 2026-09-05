"use client";

import { useState } from "react";
import useSWR from "swr";
import { stopsByLine, lineNames, type MBTALineId } from "@/lib/mbta/stops";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
const built = staticUniversalContext("LineArrivals");
let jei = 0;

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

type MBTAIncluded = {
  id: string;
  type: string;
  attributes?: { headsign?: string; destination?: string };
};

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
    trip?: { data?: { id: string } };
    vehicle?: { data?: { id: string } };
  };
};

function getHeadsign(prediction: MBTAPrediction, included: MBTAIncluded[]) {
  const trip = included?.find(
    (i) =>
      i.type === "trip" && i.id === prediction.relationships.trip?.data?.id,
  );
  return trip?.attributes?.headsign || trip?.attributes?.destination || null;
}

function getDirectionLabel(dir: number) {
  return dir === 0 ? "Outbound" : "Inbound";
}

export const routeColors: Record<string, string> = {
  Red: "bg-red-600",
  Mattapan: "bg-red-400",
  Orange: "bg-orange-600",
  Blue: "bg-blue-600",
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

export function LineArrivals({
  lineId,
  defaultStopId,
}: {
  lineId: MBTALineId;
  defaultStopId?: string;
}) {
  const stops = stopsByLine[lineId];
  logj({
    domain: "LineArrivals",
    level: "info",
    message: "LineArrivals loaded",
    file: "app/components/LineArrivals.tsx",
    line: 95,
    payload: { lineId: lineId, defaultStopId: defaultStopId, stops: stops },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const [stopId, setStopId] = useState<string>(
    defaultStopId ?? stops[0]?.id ?? "",
  );

  const { data, isLoading } = useSWR<{
    data: MBTAPrediction[];
    included: MBTAIncluded[];
  }>(`/api/arrivals/${stopId}?include=trip,route`, fetcher, {
    refreshInterval: 15000,
  });

  const predictions = data?.data ?? [];
  const included = data?.included ?? [];

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">
        {lineNames[lineId]} Arrivals
      </h1>

      {/* Stop Selector */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Choose a stop:</label>
        <select
          value={stopId}
          onChange={(e) => setStopId(e.target.value)}
          className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-900 w-full"
        >
          {stops.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.attributes.name}
            </option>
          ))}
        </select>
      </div>

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
