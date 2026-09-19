import type { ParsedTravelSnapshot } from "@/lib/travel/parser/aa";
/*
 * @FilePath: \my-new-app\lib\weather\getWeatherForTrip.ts
 * @LastEditTime: 2026-02-24 18:00:49
 */
// lib/server/weather/getWeatherForTrip.ts

export async function getWeatherForTrip(snapshot: ParsedTravelSnapshot | null) {
  if (!snapshot) return null;

  const [outbound, inbound] = snapshot.segments;
  if (!outbound || !inbound) return null;

  // Replace with Tomorrow.io or your weather provider
  return {
    outbound: {
      summary: `Weather for ${outbound.arrivalCity} on ${outbound.date}`,
    },
    return: {
      summary: `Weather for ${inbound.arrivalCity} on ${inbound.date}`,
    },
  };
}
