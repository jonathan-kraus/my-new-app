/*
 * @FilePath: \my-new-app\app\config\readj\page.tsx
 * @LastEditTime: 2026-08-04 13:46:41
 */
import { readFlightConfig, readWeatherConfig } from "./actions";

export default async function ConfigReadPage() {
  const flight = await readFlightConfig(); // ConfigEntry | null
  const weather = await readWeatherConfig(); // ConfigEntry | null

  // safe access
  {
    flight && (
      <>
        <div>{flight.Variable01}</div>
        <div>{flight.Variable02}</div>
        <div>{flight.Variable03}</div>
      </>
    );
  }

  {
    weather && (
      <>
        <div>{weather.Variable01}</div>
        <div>{weather.Variable02}</div>
        <div>{weather.Variable03}</div>
      </>
    );
  }
}
