/*
 * @FilePath: \my-new-app\app\config\readj\page.tsx
 * @LastEditTime: 2026-03-16 00:09:22
 */
import { readFlightConfig, readWeatherConfig } from "./actions";

export default async function ConfigReadPage() {
  const flight = await readFlightConfig();
  const weather = await readWeatherConfig();

  return (
    <div className="p-6 space-y-4 text-green-300 text-sm">
      <h1 className="text-xl font-bold mb-4 text-white">Config Data</h1>

      <h2 className="text-white font-semibold">Flight Config</h2>
      {flight ? (
        <>
          <div>{flight.Variable01}</div>
          <div>{flight.Variable02}</div>
          <div>{flight.Variable03}</div>
        </>
      ) : (
        <div>No Flight config found.</div>
      )}

      <h2 className="text-white font-semibold mt-6">Weather Config</h2>
      {weather ? (
        <>
          <div>{weather.Variable01}</div>
          <div>{weather.Variable02}</div>
          <div>{weather.Variable03}</div>
        </>
      ) : (
        <div>No Weather config found.</div>
      )}

      <div className="mt-6 text-white">End</div>
    </div>
  );
}
