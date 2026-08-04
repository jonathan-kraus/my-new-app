/*
 * @FilePath: \my-new-app\app\config\readj\page.tsx
 * @LastEditTime: 2026-08-04 15:46:45
 */
import { readFlightConfig, readWeatherConfig } from "./actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Config" };
export default async function ConfigReadPage() {
  const flight = await readFlightConfig();
  const weather = await readWeatherConfig();

  return (
    <>
      {flight && (
        <>
          <div>{flight.Variable01}</div>
          <div>{flight.Variable02}</div>
          <div>{flight.Variable03}</div>
        </>
      )}

      {weather && (
        <>
          <div>{weather.Variable01}</div>
          <div>{weather.Variable02}</div>
          <div>{weather.Variable03}</div>
        </>
      )}
    </>
  );
}
