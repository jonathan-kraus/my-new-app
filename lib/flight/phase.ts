/*
 * @FilePath: \my-new-app\lib\flight\phase.ts
 * @LastEditTime: 2026-03-12 21:05:14
 */
export function detectFlightPhase(live: any) {
  if (!live) return "unknown";

  const alt = live.altitude * 100; // convert hundreds → feet
  const gs = live.groundspeed ?? 0;
  const hdg = live.heading ?? 0;

  // On ground
  if (alt < 200) {
    if (gs < 40) return "taxi";
    if (gs < 80) return "takeoff roll";
    return "initial climb";
  }

  // Climb vs cruise vs descent
  if (alt >= 200 && alt < 10000) {
    if (gs > 250) return "climb";
    return "initial climb";
  }

  if (alt >= 10000 && alt < 28000) {
    return "climb";
  }

  if (alt >= 28000 && alt < 42000) {
    return "cruise";
  }

  // Descent
  if (alt < 28000 && gs > 200) {
    return "descent";
  }

  // Approach
  if (alt < 5000 && gs < 200) {
    return "approach";
  }

  // Landing
  if (alt < 1000 && gs < 150) {
    return "landing";
  }

  return "unknown";
}
