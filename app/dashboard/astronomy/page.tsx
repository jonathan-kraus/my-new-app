// app/dashboard/astronomy/page.tsx

import { getAstronomyDashboard } from "@/lib/astronomy/dashboard";
import { formatCountdown } from "@/lib/time";

export default async function AstronomyDashboardPage() {
  const data = await getAstronomyDashboard();

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        No astronomy data available.
      </div>
    );
  }

  const { today, tomorrow, solar, lunar } = data;

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Astronomy</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Solar</h2>
        <p>
          Sunrise: {today.sunrise ? today.sunrise.toLocaleTimeString() : "—"}
        </p>
        <p>Sunset: {today.sunset ? today.sunset.toLocaleTimeString() : "—"}</p>

        {solar && (
          <p>
            Next Solar Event: {solar.event} in {formatCountdown(solar.ms)}
          </p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Lunar</h2>
        <p>
          Moonrise: {today.moonrise ? today.moonrise.toLocaleTimeString() : "—"}
        </p>
        <p>
          Moonset: {today.moonset ? today.moonset.toLocaleTimeString() : "—"}
        </p>

        <p>Moon Phase: {today.moonPhase}</p>

        {lunar && (
          <p>
            Next Lunar Event: {lunar.event} in {formatCountdown(lunar.ms)}
          </p>
        )}
      </section>
    </div>
  );
}
