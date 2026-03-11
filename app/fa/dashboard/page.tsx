"use client";
import { RadarSkybox } from "@/components/RadarSkybox";
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
  return Math.max(0, Math.round(diff / 60000));
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
        backgroundColor: "#dc2626",
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
function FlightTable({ planes }: { planes: any[] }) {
  if (!planes || planes.length === 0) {
    return <p>No planes in your skybox.</p>;
  }

  return (
    <table style={{ width: "100%", marginTop: 24, borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Ident</th>
          <th>From → To</th>
          <th>Aircraft</th>
          <th>Alt</th>
          <th>GS</th>
          <th>Scheduled</th>
          <th>Estimated</th>
        </tr>
      </thead>
      <tbody>
        {planes.map((p, i) => (
          <tr key={i}>
            <td>{p.ident}</td>
            <td>{p.origin} → {p.destination}</td>
            <td>{p.aircrafttype}</td>
            <td>{p.altitude}</td>
            <td>{p.groundspeed}</td>
            <td>{formatET(p.scheduled_out)}</td>
            <td>{formatET(p.estimated_out)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  async function load() {
    const res = await fetch("/api/fa/dashboard");
    const json = await res.json();
    setData(json);
  }

  const delay = data
    ? getDelayMinutes(data.flight?.scheduled_out, data.flight?.estimated_out)
    : 0;

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
                <DelayBadge minutes={delay} />
              </p>

              <p>Scheduled: {formatET(data.flight.scheduled_out)}</p>

              <p>Estimated: {formatET(data.flight.estimated_out)}</p>

              <p>
                Gate: {data.flight.gate_origin ?? "TBD"} →{" "}
                {data.flight.gate_destination ?? "TBD"}
              </p>
              <h2 style={{ marginTop: 32 }}>📡 Skybox Radar</h2>
              <RadarSkybox count={data.count} />

              <h2 style={{ marginTop: 32 }}>🛩️ Skybox Flights</h2>
              <FlightTable planes={data.planes} />

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
