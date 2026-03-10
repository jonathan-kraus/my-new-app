/*
 * @FilePath: \my-new-app\app\fa\dashboard\page.tsx
 * @LastEditTime: 2026-03-09 20:04:29
 */
"use client";
import { Button } from "@/components/ui/buttonfly";
import { useState } from "react";

function formatET(dateString: string | null) {
  if (!dateString) return "—";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  async function load() {
    const res = await fetch("/api/fa/dashboard");
    const json = await res.json();
    setData(json);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>✈️ Flight Dashboard</h1>
      <Button onClick={load}>Update Flight Data</Button>
      <p>Flight data will be displayed here.</p>

      {data && (
        <div style={{ marginTop: 24, lineHeight: 1.6 }}>
          <h2>{data.flight?.ident_iata || "Unknown"} Status</h2>

          {data.flight ? (
            <>
              <p>
                <strong>{data.flight.ident_iata}</strong> — {data.flight.status}
              </p>
              <p>Scheduled: {formatET(data.flight.scheduled_out)}</p>
              <p>
                Estimated:{" "}
                {new Date(data.flight.estimated_out).toLocaleString()}
              </p>
              <p>
                Gate: {data.flight.gate_origin ?? "TBD"} →{" "}
                {data.flight.gate_destination ?? "TBD"}
              </p>
            </>
          ) : (
            <p>No flight found for today.</p>
          )}

          <h2 style={{ marginTop: 24 }}>📡 Flight Count</h2>
          <p>Flights in your skybox: {data.count}</p>
        </div>
      )}
    </div>
  );
}
