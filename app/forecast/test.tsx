/*
 * @FilePath: \my-new-app\app\forecast\test.tsx
 * @LastEditTime: 2026-07-19 19:53:07
 */
"use client";

import { useEffect, useState } from "react";

export default function CurrentTemp() {
  const [temp, setTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemp() {
      const lat = 40.0894;
      const lon = -75.396;

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`,
      );
      const data = await res.json();
      const celsius = data.current.temperature_2m;
      const fahrenheit = Math.round((celsius * 9) / 5 + 32);

      setTemp(fahrenheit);
      setLoading(false);
    }

    fetchTemp();
  }, []);

  return (
    <div className="p-8 text-center">
      <h1>King of Prussia, PA</h1>
      {loading ? (
        <p>Loading temperature...</p>
      ) : (
        <p className="text-7xl font-light mt-4">{temp}°F</p>
      )}
    </div>
  );
}
