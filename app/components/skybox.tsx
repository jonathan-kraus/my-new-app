"use client";

import type { Flight } from "@/lib/flight/types";
import { useEffect, useState } from "react";

export default function Skybox({
  onSelect,
}: {
  onSelect: (flightId: string) => void;
}) {
  const [planes, setPlanes] = useState<Flight[]>([]);
  const [error, setError] = useState("");
  async function loadSkybox() {
    try {
      const res = await fetch("/api/fa/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error("Nearby flight lookup failed");
      const json = await res.json();
      setPlanes(json.planes || []);
      setError("");
    } catch {
      setPlanes([]);
      setError("Could not load nearby flights.");
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadSkybox();
    });
    const timer = setInterval(loadSkybox, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">🛩️ Skybox Flights</h3>
      {error && <p role="alert">{error}</p>}

      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-700 text-slate-200">
          <tr>
            <th className="p-2">Ident</th>
            <th className="p-2">From → To</th>
            <th className="p-2">Aircraft</th>
            <th className="p-2">Alt (ft)</th>
            <th className="p-2">GS</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {planes.map((p) => {
            const origin = p.origin?.code_iata || p.origin?.city || "—";
            const dest = p.destination?.code_iata || p.destination?.city || "—";
            const alt = p.last_position ? p.last_position.altitude * 100 : "—";
            const gs = p.last_position?.groundspeed ?? "—";

            return (
              <tr
                key={p.fa_flight_id}
                className="cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <td className="p-2">
                  <button
                    onClick={() => onSelect(p.fa_flight_id)}
                    className="underline"
                  >
                    {p.ident}
                  </button>
                </td>
                <td className="p-2">
                  {origin} → {dest}
                </td>
                <td className="p-2">{p.aircraft_type || "—"}</td>
                <td className="p-2">{alt}</td>
                <td className="p-2">{gs}</td>
                <td className="p-2">Enroute</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="mt-4 text-slate-300">📡 Flight Count: {planes.length}</p>
    </div>
  );
}
