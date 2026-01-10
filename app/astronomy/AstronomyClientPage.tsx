// app/astronomy/AstronomyClientPage.tsx
"use client";

import { useAstronomy } from "@/hooks/useAstronomy";
import { SolarCard } from "./SolarCard";
import LunarCard from "./LunarCard";
import GoldenHourCard from "./GoldenHourCard";

export default function AstronomyClientPage({
  locationName,
  snapshots,
}: {
  locationName: string;
  snapshots: any[];
}) {
  const { solar, lunar } = useAstronomy(snapshots);

  if (!solar || !lunar) {
    return (
      <div className="p-8 text-red-300">
        Unable to load astronomy data.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-700 to-sky-900 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-semibold mb-1">
            Astronomy for {locationName}
          </h1>
          <p className="text-sky-200">
            Updated{" "}
            {solar.fetchedAt.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              timeZone: "America/New_York",
            })}
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SolarCard {...solar} />
          <LunarCard {...lunar} />
          <GoldenHourCard {...solar} />
        </section>
      </div>
    </div>
  );
}
