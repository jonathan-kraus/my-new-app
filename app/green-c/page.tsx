/*
 * @FilePath: \my-new-app\app\green-c\page.tsx
 * @LastEditTime: 2026-08-22 22:47:11
 */
"use client";

import useSWR from "swr";
import { useState } from "react";
import { logj } from "@/lib/log/client";
import { staticUniversalContext } from "@/lib/log/buildj";

const built = await staticUniversalContext("mbta-green-c");
let jei = 0;
const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Hard-coded Green-C stops (accurate MBTA IDs)
const greenCStops = [
  { id: "place-clmnl", name: "Cleveland Circle" },
  { id: "place-engav", name: "Englewood Ave" },
  { id: "place-denrd", name: "Dean Road" },
  { id: "place-tapst", name: "Tappan Street" },
  { id: "place-wascm", name: "Washington Square" },
  { id: "place-fbkst", name: "Fairbanks Street" },
  { id: "place-brnhl", name: "Brandon Hall" },
  { id: "place-sumav", name: "Summit Ave" },
  { id: "place-coecl", name: "Coolidge Corner" },
  { id: "place-stplb", name: "St. Paul Street" },
  { id: "place-kntst", name: "Kent Street" },
  { id: "place-hwsst", name: "Hawes Street" },
  { id: "place-smary", name: "St. Mary’s Street" },
];

export default function GreenCPage() {
  // Default stop = Dean Road
  const [stopId, setStopId] = useState("place-denrd");
  logj({
    domain: "green-c",
    level: "info",
    message: "Green-C Started",
    file: "app/api/notes/route.ts",
    line: 36,
    payload: {
      stopId: stopId,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const { data, isLoading } = useSWR(`/api/arrivals/${stopId}`, fetcher, {
    refreshInterval: 15000,
  });

  const predictions = data?.data?.slice(0, 3) ?? [];

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Green Line C — Predictions</h1>

      {/* Stop Selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: "bold" }}>Choose a stop:</label>
        <select
          value={stopId}
          onChange={(e) => setStopId(e.target.value)}
          style={{
            marginLeft: 10,
            padding: 6,
            backgroundColor: "#222", // dark background
            color: "#fff", // white text
            border: "1px solid #555",
            borderRadius: 6,
          }}
        >
          {greenCStops.map((stop) => (
            <option
              key={stop.id}
              value={stop.id}
              style={{
                backgroundColor: "#222",
                color: "#fff",
              }}
            >
              {stop.name}
            </option>
          ))}
        </select>
      </div>

      {/* Predictions */}
      <h2>Next arrivals for {stopId}</h2>

      {isLoading && <div>Loading predictions…</div>}

      {!isLoading && predictions.length === 0 && (
        <div>No predictions available.</div>
      )}

      <ul>
        {predictions.map((p: any) => {
          const arrival = p.attributes?.arrival_time;
          const dep = p.attributes?.departure_time;
          const time = arrival || dep;

          return (
            <li key={p.id}>
              {p.relationships.route.data.id} —{" "}
              {time ? new Date(time).toLocaleTimeString() : "No time"}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
