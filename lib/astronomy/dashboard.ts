import { loadAstronomySnapshots } from "@/app/astronomy/loader";

export async function getAstronomyDashboard() {
  return await loadAstronomySnapshots();
}
