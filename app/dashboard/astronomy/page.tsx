// app/dashboard/astronomy/page.tsx
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import { AstronomyCard } from "@/app/astronomy/AstronomyCard";

export default async function DashboardAstronomyPage() {
  const snapshot = await getEphemerisSnapshot("KOP");

  return (
    <div className="p-6">
      <AstronomyCard data={snapshot} />
    </div>
  );
}
