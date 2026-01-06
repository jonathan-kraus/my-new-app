import { db } from "@/lib/db";
import { SolarCard } from "./SolarCard";
import LunarCard from "./LunarCard";
import GoldenHourCard from "./GoldenHourCard";

export default async function AstronomyPage() {
  // Fetch the default location
  const location = await db.location.findFirst({
    where: { isDefault: true },
  });

  if (!location) {
    return (
      <div className="p-8 text-red-300">
        No default location found in the database.
      </div>
    );
  }

  // Fetch the latest astronomy snapshot for that location
  const snapshot = await db.astronomySnapshot.findFirst({
    where: { locationId: location.id },
    orderBy: { fetchedAt: "desc" },
  });

  if (!snapshot) {
    return (
      <div className="p-8 text-red-300">
        No astronomy data found for {location.name}.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-700 to-sky-900 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-semibold mb-1">
            Astronomy for {location.name}
          </h1>
          <p className="text-sky-200">
            Updated {snapshot.fetchedAt.toLocaleTimeString()}
          </p>
        </header>

        {/* Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SolarCard
            sunrise={snapshot.sunrise.toISOString()}
            sunset={snapshot.sunset.toISOString()}
            fetchedAt={snapshot.fetchedAt.toISOString()}
          />

          <LunarCard
            moonrise={snapshot.moonrise?.toISOString() ?? null}
            moonset={snapshot.moonset?.toISOString() ?? null}
            fetchedAt={snapshot.fetchedAt.toISOString()}
          />

          <GoldenHourCard
            sunriseBlueStart={snapshot.sunriseBlueStart!.toISOString()}
            sunriseBlueEnd={snapshot.sunriseBlueEnd!.toISOString()}
            sunriseGoldenStart={snapshot.sunriseGoldenStart!.toISOString()}
            sunriseGoldenEnd={snapshot.sunriseGoldenEnd!.toISOString()}
            sunsetGoldenStart={snapshot.sunsetGoldenStart!.toISOString()}
            sunsetGoldenEnd={snapshot.sunsetGoldenEnd!.toISOString()}
            sunsetBlueStart={snapshot.sunsetBlueStart!.toISOString()}
            sunsetBlueEnd={snapshot.sunsetBlueEnd!.toISOString()}
            fetchedAt={snapshot.fetchedAt.toISOString()}
          />
        </section>
      </div>
    </div>
  );
}
