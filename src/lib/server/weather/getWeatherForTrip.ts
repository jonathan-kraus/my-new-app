/*
 * @FilePath: \my-new-app\lib\weather\getWeatherForTrip.ts
 * @LastEditTime: 2026-02-24 18:00:49
 */
// lib/server/weather/getWeatherForTrip.ts

export async function getWeatherForTrip(snapshot: any) {
  if (!snapshot) return null;

  const [outbound, inbound] = snapshot.segments;

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
