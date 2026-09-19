import type { AstronomySnapshot } from "@/lib/astronomy";

import { getAstronomyForDashboard } from "@/lib/astronomy";

export interface AstronomyDashboardResponse {
  todaySnapshot: AstronomySnapshot | null;
  tomorrowSnapshot: AstronomySnapshot | null;
  allSnapshots: AstronomySnapshot[];
}

export async function getAstronomyDashboard(
  locationId: string,
): Promise<AstronomyDashboardResponse> {
  const { todaySnapshot, tomorrowSnapshot, allSnapshots } =
    await getAstronomyForDashboard(locationId);

  return {
    todaySnapshot,
    tomorrowSnapshot,
    allSnapshots,
  };
}
