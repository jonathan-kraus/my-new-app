"use client";
// app\fa\dashboard\page.tsx
import type { FlightDashboardData } from "@/lib/flight/types";
import { useEffect, useState } from "react";
import Skybox from "@/components/skybox";

export default function FlightDashboard() {
  const [data, setData] = useState<FlightDashboardData | null>(null);
  const [identInput, setIdentInput] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      // The endpoint reads the configured flight ID on the server.
      const res = await fetch(`/api/fa/flight/`);
      if (!res.ok) throw new Error("Could not load flight data.");
      const json = await res.json();
      setData(json);
      setError("");
    } catch {
      setError("Could not load flight data. Please try again.");
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      load();
    });
  }, []);

  async function updateFlight() {
    if (!identInput) return;
    try {
      const res = await fetch("/api/set-flight-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ident: identInput }),
      });
      if (!res.ok) {
        setError(
          res.status === 401
            ? "Please sign in to change the flight."
            : res.status === 403
              ? "Administrator access is required to change the flight."
              : "Could not save the flight identifier.",
        );
        return;
      }
      await load();
    } catch {
      setError("Could not save the flight identifier. Please try again.");
    }
  }

  return (
    <div className="p-6 text-white space-y-8">
      <h1 className="text-3xl font-bold">✈️ Flight Dashboard</h1>
      {error && (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      )}

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
                {data.gate_origin || "—"} → {data.gate_destination || "—"}
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
