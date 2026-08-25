/*
 * @FilePath: \my-new-app\app\green-c\page.tsx
 * @LastEditTime: 2026-08-25 01:54:33
 */
"use client";

import { useState } from "react";
import useSWR from "swr";
import { ArrivalsWidget } from "@/components/ArrivalsWidget";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
  { id: "place-cool", name: "Coolidge Corner" },
  { id: "place-stpul", name: "Saint Paul Street" },
  { id: "place-kntst", name: "Kent Street" },
  { id: "place-hwsst", name: "Hawes Street" },
  { id: "place-smary", name: "Saint Mary's Street" },

  // Shared trunk
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

  // Stop details
  const { data: allStops } = useSWR(showDetails ? "/api/stops" : null, fetcher);

  const stopInfo = allStops?.data?.find((s: any) => s.id === stopId);

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

      {/* ⭐ NEW: Arrivals Widget */}
      <ArrivalsWidget stop={stopId} />

      {/* Details Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          marginTop: 20,
          padding: "8px 14px",
          backgroundColor: "#00843D",
          color: "yellow",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {showDetails ? "Hide Details" : "Show Stop Details"}
      </button>

      {/* Stop Details */}
      {showDetails && stopInfo && (
        <div className="mt-4 p-4 bg-muted/30 rounded-md text-sm">
          <h3 className="font-semibold mb-2">Stop Info</h3>

          <p>
            <strong>Name:</strong> {stopInfo.attributes.name}
          </p>
          <p>
            <strong>Municipality:</strong> {stopInfo.attributes.municipality}
          </p>
          <p>
            <strong>Latitude:</strong> {stopInfo.attributes.latitude}
          </p>
          <p>
            <strong>Longitude:</strong> {stopInfo.attributes.longitude}
          </p>
        </div>
      )}
    </div>
  );
}
