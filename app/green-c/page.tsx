/*
 * @FilePath: \my-new-app\app\green-c\page.tsx
 * @LastEditTime: 2026-08-23 20:48:34
 */
"use client";

import useSWR from "swr";
import { useState } from "react";

interface MBTAPrediction {
  id: string;
  attributes: {
    arrival_time?: string;
    departure_time?: string;
    direction_id: number;
  };
  relationships: {
    trip: { data: { id: string } | null };
    route: { data: { id: string } };
  };
}

const fetcher = (url: string): Promise<any> => fetch(url).then((r) => r.json());

// Green Line C stops
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
  { id: "place-hymnl", name: "Hynes Convention Center" },
];

export default function GreenCPage() {
  const [stopId, setStopId] = useState("place-denrd");
  const [showDetails, setShowDetails] = useState(false);

  // Predictions from your API route
  const { data, isLoading } = useSWR<{
    stop: string;
    predictions: MBTAPrediction[];
  }>(`/api/arrivals/${stopId}`, fetcher, {
    refreshInterval: 15000,
  });

  console.log("PREDICTIONS", data);

  // Correct shape — your API returns { stop, predictions }
  const predictions: MBTAPrediction[] = data?.predictions ?? [];

  // Sort by arrival/departure time
  const sorted = [...predictions].sort((a, b) => {
    const ta = a.attributes.arrival_time ?? a.attributes.departure_time;
    const tb = b.attributes.arrival_time ?? b.attributes.departure_time;
    return new Date(ta ?? 0).getTime() - new Date(tb ?? 0).getTime();
  });

  // Only show first 4
  const nextFour = sorted.slice(0, 4);

  // Stop details
  const { data: allStops } = useSWR(showDetails ? "/api/stops" : null, fetcher);
  const selectedStop = greenCStops.find((s) => s.id === stopId);

  function getTime(prediction: MBTAPrediction) {
    const arrival = prediction.attributes.arrival_time;
    const dep = prediction.attributes.departure_time;
    const t = arrival || dep;
    return t
      ? new Date(t).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "—";
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#00843D" }}>🟢🚋 Green Line C</h1>

      {/* Stop Selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: "bold" }}>Choose a stop:</label>
        <select
          value={stopId}
          onChange={(e) => {
            setStopId(e.target.value);
            setShowDetails(false);
          }}
          style={{
            marginLeft: 10,
            padding: 6,
            backgroundColor: "#222",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: 6,
          }}
        >
          {greenCStops.map((stop) => (
            <option
              key={stop.id}
              value={stop.id}
              style={{ backgroundColor: "#222", color: "#fff" }}
            >
              {stop.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stop Details */}
      {showDetails && (
        <div
          style={{
            background: "#111",
            padding: 12,
            borderRadius: 8,
            borderLeft: "6px solid #00843D",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: "bold" }}>
            {
              allStops?.data?.find((s: any) => s.id === stopId)?.attributes
                ?.name
            }
          </div>
          <div style={{ opacity: 0.8 }}>
            {
              allStops?.data?.find((s: any) => s.id === stopId)?.attributes
                ?.description
            }
          </div>
        </div>
      )}

      {/* Predictions */}
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <h2 style={{ color: "#00843D" }}>
          Next arrivals for {selectedStop?.name}
        </h2>
      </div>

      {isLoading && <div>Loading predictions…</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {nextFour.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#111",
              padding: 12,
              borderRadius: 8,
              borderLeft: "6px solid #00843D",
            }}
          >
            {(() => {
              const routeId = p.relationships.route.data.id; // "Green-C"
              const routeLabel = routeId.replace("Green-", "Green‑");

              return (
                <>
                  <div style={{ fontSize: 18, fontWeight: "bold" }}>
                    🟢🚋 {routeLabel} — {getTime(p)}
                  </div>

                  <div style={{ opacity: 0.8 }}>—</div>
                </>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Details Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          marginTop: 20,
          padding: "8px 14px",
          backgroundColor: "#00843D",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {showDetails ? "Hide Details" : "Show Stop Details"}
      </button>
    </div>
  );
}
