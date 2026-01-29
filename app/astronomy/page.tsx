import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import SolarCard from "@/app/components/ephemeris/solarCard";
import LunarCard from "@/app/components/ephemeris/lunarCard";

export default async function AstronomyPage() {
  const ephemeris = await getEphemerisSnapshot("KOP");

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-4xl font-bold tracking-tight">Solar Overview</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {" "}
        {ephemeris.snapshot ? (
          <>
            {" "}
            <SolarCard snapshot={ephemeris.snapshot.solar} />{" "}
            <LunarCard snapshot={ephemeris.snapshot.lunar} />{" "}
          </>
        ) : (
          <div className="p-4 text-gray-500 col-span-2">
            {" "}
            No astronomy data available yet{" "}
          </div>
        )}{" "}
      </section>
    </div>
  );
}
