import { queryAxiom } from "@/lib/axiom/query";

export const dynamic = "force-dynamic";

export default async function ConfigReadPage() {
  console.log("=== PAGE START ===");

  // -----------------------------
  // Query 1: Flight (last 4 hours)
  // -----------------------------
  const qFlight = `
| where _time > ago(4h)
| where parsed.payload.data1.reason == "Flight"
| sort by _time desc
| take 1
`;

  const flightRows = (await queryAxiom(qFlight, 15000)) ?? [];
  const flight = flightRows[0] ?? null;

  // -----------------------------
  // Query 2: Weather (last 4 hours)
  // -----------------------------
  const qWeather = `
| where _time > ago(4h)
| where parsed.payload.data2.reason == "Weather"
| sort by _time desc
| take 1
`;

  const weatherRows = (await queryAxiom(qWeather, 15000)) ?? [];
  const weather = weatherRows[0] ?? null;

  return (
    <div className="p-6 space-y-4 text-green-300 text-sm">
      <h1 className="text-xl font-bold mb-4 text-white">Config Data</h1>

      <h2 className="text-white font-semibold">Flight Config</h2>
      {flight ? (
        <pre className="bg-black/40 p-4 rounded text-xs text-white">
          {JSON.stringify(flight, null, 2)}
        </pre>
      ) : (
        <div>No Flight config found in last 4 hours.</div>
      )}

      <h2 className="text-white font-semibold mt-6">Weather Config</h2>
      {weather ? (
        <pre className="bg-black/40 p-4 rounded text-xs text-white">
          {JSON.stringify(weather, null, 2)}
        </pre>
      ) : (
        <div>No Weather config found in last 4 hours.</div>
      )}

      <div className="mt-6 text-white">End</div>
    </div>
  );
}
