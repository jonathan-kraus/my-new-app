import { getAstronomySnapshot } from "@/lib/astronomy/getAstronomySnapshot";

export async function getAstronomySnapshots() {
  return getAstronomySnapshot("KOP");
}
