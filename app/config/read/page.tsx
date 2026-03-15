/*
 * @FilePath: \my-new-app\app\config\read\page.tsx
 * @LastEditTime: 2026-03-15 19:12:32
 */
import { queryAxiom } from "@/lib/axiom/query";

export const dynamic = "force-dynamic";

export default async function ConfigReadPage() {
  console.log("=== PAGE START ===");

  // -----------------------------
  // Query 1: Flight
  // -----------------------------
  const qFlight = `
| where parsed.payload.data1.reason == "Flight"
| sort by _time desc
| take 1
`;

  const flightRows = (await queryAxiom(qFlight, 15000)) ?? [];
  const flight = flightRows[0] ?? null;

  // -----------------------------
  // Query 2: Weather
  // -----------------------------
  const qWeather = `
| where parsed.payload.data2.reason == "Weather"
| sort by _time desc
| take 1
`;

  const weatherRows = (await queryAxiom(qWeather, 15000)) ?? [];
  const weather = weatherRows[0] ?? null;

  // -----------------------------
  // ALWAYS RETURN JSX
  // -----------------------------
  return (
    <div className="p-6 space-y-4 text-green-300 text-sm">
      <h1 className="text-xl font-bold mb-4 text-white">Config Data</h1>

      <h2 className="text-white font-semibold">Flight Config</h2>
      {flight ? (
        <pre className="bg-black/40 p-4 rounded text-xs text-white">
          {JSON.stringify(flight, null, 2)}
        </pre>
      ) : (
        <div>No Flight config found.</div>
      )}

      <h2 className="text-white font-semibold mt-6">Weather Config</h2>
      {weather ? (
        <pre className="bg-black/40 p-4 rounded text-xs text-white">
          {JSON.stringify(weather, null, 2)}
        </pre>
      ) : (
        <div>No Weather config found.</div>
      )}

      <div className="mt-6 text-white">End</div>
    </div>
  );
}
