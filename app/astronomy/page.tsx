import { getAstronomyForDashboard } from "@/lib/astronomy";
import AstronomyPageClient from "./AstronomyPageClient";

export default async function AstronomyPage() {
  const { allSnapshots } = await getAstronomyForDashboard("KOP");

  return <AstronomyPageClient snapshots={allSnapshots} />;
}
