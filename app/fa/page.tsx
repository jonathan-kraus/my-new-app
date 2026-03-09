/*
 * @FilePath: \my-new-app\app\fa\page.tsx
 * @LastEditTime: 2026-03-09 13:42:56
 */
// app/fa/page.tsx
"use client";

import { useState } from "react";

export default function FlightAwareCount() {
  const [count, setCount] = useState<number | null>(null);

  async function fetchCount() {
    const res = await fetch(
      `/api/fa/count?minLat=40.0893&minLon=-75.3836&maxLat=42.3318&maxLon=-71.1212`,
    );
    const data = await res.json();
    setCount(data.count);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>FlightAware Count</h1>
      <button onClick={fetchCount}>Get Flight Count</button>

      {count !== null && (
        <p style={{ marginTop: 16 }}>Flights in box: {count}</p>
      )}
    </div>
  );
}
