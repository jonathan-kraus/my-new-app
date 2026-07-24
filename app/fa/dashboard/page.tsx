"use client";
// app\fa\dashboard\page.tsx
import { useEffect, useState } from "react";
import Skybox from "@/components/skybox";
import { getConfig } from "@/lib/runtime/config";

export default function FlightDashboard() {
  const [data, setData] = useState<any>(null);
  const [identInput, setIdentInput] = useState("");

  async function load() {
    const ident = await getConfig("flight-ID", "ident");
    console.log("IDENT:", ident);
    if (!ident) return;

    const res = await fetch(`/api/fa/flight/`);
    const json = await res.json();
    setData(json);
  }

useEffect(() => {
  queueMicrotask(() => {
    load();
  });
}, []);


  async function updateFlight() {
    if (!identInput) return;

    await fetch("/api/set-flight-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ident: identInput }),
    });

    window.location.href = "/fa/dashboard";
  }

  return (
    <div className="p-6 text-white space-y-8">
      <h1 className="text-3xl font-bold">✈️ Flight Dashboard</h1>

      <button
        onClick={load}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
      >
        Update Flight Data
      </button>

      <div suppressHydrationWarning>
        {data ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">{data.ident} Status</h2>
            <p className="text-lg mb-4">
              {data.ident} — {data.status}
            </p>

            <div className="space-y-1 text-slate-300">
              <p>
                <strong className="text-white">Scheduled:</strong>{" "}
                {data.scheduled_out
                  ? new Date(data.scheduled_out).toLocaleString()
                  : "—"}
              </p>
              <p>
                <strong className="text-white">Estimated:</strong>{" "}
                {data.estimated_out
                  ? new Date(data.estimated_out).toLocaleString()
                  : "—"}
              </p>
              <p>
                <strong className="text-white">Gate:</strong>{" "}
                {data.gate_out || "—"} → {data.gate_in || "—"}
              </p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              📡 Live Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <p>
                <strong className="text-white">Altitude:</strong>{" "}
                {data.live_altitude ?? "—"} ft
              </p>
              <p>
                <strong className="text-white">Groundspeed:</strong>{" "}
                {data.live_groundspeed ?? "—"} kts
              </p>
              <p>
                <strong className="text-white">Heading:</strong>{" "}
                {data.live_heading ?? "—"}°
              </p>
              <p>
                <strong className="text-white">Latitude:</strong>{" "}
                {data.live_latitude ?? "—"}
              </p>
              <p>
                <strong className="text-white">Longitude:</strong>{" "}
                {data.live_longitude ?? "—"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Loading flight data…</p>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Select Flight</h3>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter flight ident (e.g., UAL607)"
            value={identInput}
            onChange={(e) => setIdentInput(e.target.value.toUpperCase())}
            className="px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white w-64"
          />

          <button
            onClick={updateFlight}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white"
          >
            Load Flight
          </button>
        </div>
      </div>

      <Skybox />
    </div>
  );
}
