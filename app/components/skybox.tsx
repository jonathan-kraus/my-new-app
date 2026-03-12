"use client";

import { useEffect, useState } from "react";

export default function Skybox() {
  const [planes, setPlanes] = useState<any[]>([]);

  async function loadSkybox() {
    const res = await fetch("/api/fa/dashboard");
    const json = await res.json();
    setPlanes(json.planes || []);
  }

  useEffect(() => {
    loadSkybox();
  }, []);

  async function selectFlight(ident: string) {
    await fetch("/api/set-flight-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ident }),
    });

    window.location.href = "/fa/dashboard";
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">🛩️ Skybox Flights</h3>

      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-700 text-slate-200">
          <tr>
            <th className="p-2">Ident</th>
            <th className="p-2">From → To</th>
            <th className="p-2">Aircraft</th>
            <th className="p-2">Alt</th>
            <th className="p-2">GS</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {planes.map((p, i) => {
            const origin = p.origin?.code_iata || p.origin?.city || "—";
            const dest = p.destination?.code_iata || p.destination?.city || "—";
            const alt = p.last_position?.altitude ?? "—";
            const gs = p.last_position?.groundspeed ?? "—";

            return (
              <tr
                key={i}
                onClick={() => selectFlight(p.ident)}
                className="cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <td className="p-2">{p.ident}</td>
                <td className="p-2">
                  {origin} → {dest}
                </td>
                <td className="p-2">{p.aircraft_type || "—"}</td>
                <td className="p-2">{alt}</td>
                <td className="p-2">{gs}</td>
                <td className="p-2">{alt > 0 ? "Enroute" : "On Ground"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="mt-4 text-slate-300">📡 Flight Count: {planes.length}</p>
    </div>
  );
}
