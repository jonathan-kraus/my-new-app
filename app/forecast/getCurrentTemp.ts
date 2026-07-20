/*
 * @FilePath: \my-new-app\app\forecast\getCurrentTemp.ts
 * @LastEditTime: 2026-07-20 03:06:22
 */
// app/forecast/getCurrentTemp.ts
import { db } from "@/lib/db";

export async function getCurrentTemp() {
  const location = await db.location.findUnique({
    where: { key: "KOP" },
  });

  if (!location) throw new Error("Location not found for key KOP");

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m&temperature_unit=fahrenheit&timezone=${location.timezone}`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch temperature");

  const data = await res.json();
  return data.current.temperature_2m;
}
