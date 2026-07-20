/*
 * @FilePath: \my-new-app\app\forecast\CurrentTempClient.tsx
 * @LastEditTime: 2026-07-19 23:39:42
 */
// app/forecast/CurrentTempClient.tsx
"use client";

import { useEffect, useState } from "react";

export default function CurrentTempClient() {
  const [temp, setTemp] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTemp() {
      const lat = 40.0894; // change to db2 call
      const lon = -75.396;

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`,
      );
      const data = await res.json();
      const celsius = data.current.temperature_2m;
      const fahrenheit = Math.round((celsius * 9) / 5 + 32);

      setTemp(fahrenheit);
    }

    fetchTemp();
  }, []);

  return (
    <>
      <h1>King of Prussia, PA</h1>
      {temp === null ? (
        <p>Loading temperature...</p>
      ) : (
        <p className="text-7xl font-light mt-4">{temp}°F</p>
      )}
    </>
  );
}
