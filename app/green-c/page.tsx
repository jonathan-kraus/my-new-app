/*
 * @FilePath: \my-new-app\app\green-c\page.tsx
 * @LastEditTime: 2026-08-24 15:21:24
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

interface MBTATrip {
  id: string;
  attributes: {
    headsign?: string;
  };
}

const fetcher = (url: string): Promise<any> => fetch(url).then((r) => r.json());

// Green Line C stops
const greenCStops = [
  { id: "place-clmnl", name: "Cleveland Circle" },
  { id: "place-engav", name: "Englewood Avenue" },
  { id: "place-denrd", name: "Dean Road" },
  { id: "place-tapst", name: "Tappan Street" },
  { id: "place-bcnwa", name: "Washington Square" },
  { id: "place-fbkst", name: "Fairbanks Street" },
  { id: "place-bndhl", name: "Brandon Hall" },
  { id: "place-sumav", name: "Summit Avenue" },
  { id: "place-cool", name: "Coolidge Corner" }, // ⭐ FIXED
  { id: "place-stpul", name: "Saint Paul Street" },
  { id: "place-kntst", name: "Kent Street" },
  { id: "place-hwsst", name: "Hawes Street" },
  { id: "place-smary", name: "Saint Mary's Street" },

  // Shared trunk stops (still part of Green‑C service)
  { id: "place-kencl", name: "Kenmore" },
  { id: "place-hymnl", name: "Hynes Convention Center" },
  { id: "place-coecl", name: "Copley" },
  { id: "place-armnl", name: "Arlington" },
  { id: "place-boyls", name: "Boylston" },
  { id: "place-pktrm", name: "Park Street" },
  { id: "place-gover", name: "Government Center" },
];

export default function GreenCPage() {
  const [stopId, setStopId] = useState("place-denrd");
  const [showDetails, setShowDetails] = useState(false);

  // Predictions + trip info
  const { data, isLoading } = useSWR<{
    data: MBTAPrediction[];
    included: MBTATrip[];
  }>(`/api/arrivals/${stopId}?include=trip`, fetcher, {
    refreshInterval: 15000,
  });

  const predictions = data?.data?.slice(0, 4) ?? [];
  const included = data?.included ?? [];

  // Stop details
  const { data: allStops } = useSWR(showDetails ? "/api/stops" : null, fetcher);

  const stopInfo = allStops?.data?.find((s: any) => s.id === stopId);

  function getHeadsign(prediction: MBTAPrediction) {
    const tripId = prediction.relationships?.trip?.data?.id;
    return included.find((i: MBTATrip) => i.id === tripId)?.attributes
      ?.headsign;
  }

  function getDirection(prediction: MBTAPrediction) {
    return prediction.attributes.direction_id === 0 ? "Westbound" : "Eastbound";
  }

  function getTime(prediction: MBTAPrediction) {
    const arrival = prediction.attributes?.arrival_time;
    const dep = prediction.attributes?.departure_time;
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

      {/* Predictions */}
      <h2 style={{ marginBottom: 10 }}>
        Next arrivals for <span style={{ color: "#00843D" }}>{stopId}</span>
      </h2>

      {isLoading && <div>Loading predictions…</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {predictions.map((p: MBTAPrediction) => (
          <div
            key={p.id}
            style={{
              background: "#111",
              padding: 12,
              borderRadius: 8,
              borderLeft: "6px solid #00843D",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: "bold" }}>
              🟢🚋 Green‑C — {getTime(p)}
            </div>
            <div style={{ opacity: 0.8 }}>
              {getHeadsign(p)} - {getDirection(p)}
            </div>
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

      {/* Stop Details */}
      {showDetails && allStops && (
        <div className="mt-4 p-4 bg-muted/30 rounded-md text-sm">
          <h3 className="font-semibold mb-2">Stop Info</h3>

          {(() => {
            const stopInfo = allStops.data.find((s: any) => s.id === stopId);
            if (!stopInfo) return <p>No stop info found.</p>;

            return (
              <>
                <p>
                  <strong>Name:</strong> {stopInfo.attributes.name}
                </p>
                <p>
                  <strong>Municipality:</strong>{" "}
                  {stopInfo.attributes.municipality}
                </p>
                <p>
                  <strong>Latitude:</strong> {stopInfo.attributes.latitude}
                </p>
                <p>
                  <strong>Longitude:</strong> {stopInfo.attributes.longitude}
                </p>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
