// app/astronomy/page.tsx

import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import SolarCard from "@/app/components/ephemeris/SolarCard";
import LunarCard from "@/components/ephemeris/LunarCard";

export default async function AstronomyPage() {
  const ephemeris = await getEphemerisSnapshot("KOP");

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-4xl font-bold">Astronomy Overview</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SolarCard snapshot={ephemeris.solar} />
        <LunarCard snapshot={ephemeris.lunar} />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Raw Ephemeris Snapshot</h2>
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg text-sm overflow-x-auto">
          {JSON.stringify(ephemeris, null, 2)}
        </pre>
      </section>
    </div>
  );
}
