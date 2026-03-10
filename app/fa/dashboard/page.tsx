/*
 * @FilePath: \my-new-app\app\fa\dashboard\page.tsx
 * @LastEditTime: 2026-03-09 21:00:25
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

function getDelayMinutes(scheduled: string | null, estimated: string | null) {
  if (!scheduled || !estimated) return 0;

  const sched = new Date(scheduled).getTime();
  const est = new Date(estimated).getTime();

  const diff = est - sched;
  return Math.max(0, Math.round(diff / 60000)); // minutes
}

function formatDelay(minutes: number) {
  if (minutes <= 0) return null;

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h > 0) return `+${h}h ${m}m delay`;
  return `+${m}m delay`;
}
function DelayBadge({ minutes }: { minutes: number }) {
  if (minutes <= 0) return null;

  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: "#dc2626", // red
        color: "white",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: 600,
        marginLeft: "8px",
      }}
    >
      {formatDelay(minutes)}
    </span>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  async function load() {
    const res = await fetch("/api/fa/dashboard");
    const json = await res.json();
    setData(json);
    const delay = getDelayMinutes(
  data.flight.scheduled_out,
  data.flight.estimated_out
);





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
              <p>
  <strong>{data.flight.ident_iata}</strong> — {data.flight.status}
  <DelayBadge minutes={delay} />
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
}}
