/*
 * @FilePath: \my-new-app\app\green-c\page.tsx
 * @LastEditTime: 2026-08-25 17:45:43
 */
"use client";

import { useState } from "react";
import useSWR from "swr";
import { greenCStops } from "@/lib/mbta/types";

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

export default function GreenCPage() {
  const [stopId, setStopId] = useState<string>("place-denrd");

  const { data, isLoading } = useSWR<{
    data: MBTAPrediction[];
    included: MBTARoute[];
  }>(`/api/arrivals/${stopId}?include=route`, fetcher, {
    refreshInterval: 15000,
  });

  const predictions = data?.data ?? [];

  const inbound = predictions.filter((p) => p.attributes?.direction_id === 0);

  const outbound = predictions.filter((p) => p.attributes?.direction_id === 1);

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold  justify-center mb-6">
        Train Arrivals
      </h1>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Choose a stop:</label>
        <select
          value={stopId}
          onChange={(e) => setStopId(e.target.value)}
          className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-900 w-full"
        >
          {greenCStops.map(
            (stop: { id: string; attributes: { name: string } }) => (
              <option key={stop.id} value={stop.id}>
                {stop.attributes.name}
              </option>
            ),
          )}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inbound */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Inbound (Downtown)</h2>

          {isLoading ? (
            <p>Loading…</p>
          ) : inbound.length === 0 ? (
            <p>No inbound trains predicted.</p>
          ) : (
            inbound.map((p) => (
              <div key={p.id} className="mb-3 p-2 bg-gray-700 rounded">
                <p>
                  <strong>Route:</strong>{" "}
                  {p.relationships.route?.data?.id ?? "Unknown"}
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
                  <strong>Vehicle:</strong>{" "}
                  {p.relationships.vehicle?.data?.id ?? "Unknown"}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Outbound */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">
            Outbound (Cleveland Circle)
          </h2>

          {isLoading ? (
            <p>Loading…</p>
          ) : outbound.length === 0 ? (
            <p>No outbound trains predicted.</p>
          ) : (
            outbound.map((p) => (
              <div key={p.id} className="mb-3 p-2 bg-gray-700 rounded">
                <p>
                  <strong>Route:</strong>{" "}
                  {p.relationships.route?.data?.id ?? "Unknown"}
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
                  <strong>Vehicle:</strong>{" "}
                  {p.relationships.vehicle?.data?.id ?? "Unknown"}
                </p>
              </div>
            ))
          )}
        </div>
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

type MBTARoute = {
  id: string;
  attributes: {
    long_name: string;
    short_name: string;
    direction_names: string[];
    direction_destinations: string[];
  };
};
