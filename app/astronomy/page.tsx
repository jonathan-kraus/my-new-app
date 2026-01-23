// app/astronomy/page.tsx

import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import SolarCard from "@/app/components/ephemeris/solarCard";
import LunarCard from "@/app/components/ephemeris/LunarCard";

export default async function AstronomyPage() {
  const ephemeris = await getEphemerisSnapshot("KOP");

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-4xl font-bold tracking-tight">Solar Overview</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SolarCard snapshot={ephemeris.solar} />
        <LunarCard snapshot={ephemeris.lunar} />
      </section>
    </div>
  );
}
