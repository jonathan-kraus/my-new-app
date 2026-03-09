/*
 * @FilePath: \my-new-app\app\fa\status\page.tsx
 * @LastEditTime: 2026-03-09 17:29:21
 */
"use client";

import { useState } from "react";

export default function FlightStatusPage() {
  const [status, setStatus] = useState<any>(null);

  async function fetchStatus() {
    const res = await fetch(`/api/fa/status?ident=AA877`);
    const data = await res.json();
    setStatus(data.flights?.[0] ?? null);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Flight Status: AA 877</h1>
      <button onClick={fetchStatus}>Get Status</button>

      {status && (
        <div style={{ marginTop: 16 }}>
          <p><strong>{status.ident}</strong></p>
          <p>
            {status.origin.code} → {status.destination.code}
          </p>

          <p>Status: {status.status}</p>

          <p>
            Scheduled Departure:{" "}
            {new Date(status.scheduled_out).toLocaleString()}
          </p>
          <p>
            Updated Departure:{" "}
            {new Date(status.estimated_out).toLocaleString()}
          </p>

          <p>
            Scheduled Arrival:{" "}
            {new Date(status.scheduled_in).toLocaleString()}
          </p>
          <p>
            Updated Arrival:{" "}
            {new Date(status.estimated_in).toLocaleString()}
          </p>

          <p>
            Gate: {status.gate_origin} → {status.gate_destination}
          </p>
        </div>
      )}
    </div>
  );
}
