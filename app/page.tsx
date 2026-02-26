// app/page.tsx
import { auth } from "@/auth";
import { headers } from "next/headers";
import { logit } from "@/lib/log/logit";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/lib/db";
import { RecentActivity } from "@/components/activity/RecentActivity";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const h = await headers();
  const session = await auth();

  const ctx = {
    requestId: crypto.randomUUID(),
    page: "Home Page",
    userId: session?.user?.id ?? "Guest",
  };

  await logit(
    "jonathan",
    {
      level: "info",
      message: "Visited dashboard",
      payload: {
        sessionUser: session?.user?.name ?? null,
        sessionEmail: session?.user?.email ?? null,
        userId: session?.user?.id ?? null,
      },
    },
    ctx
  );

  // -----------------------------
  // LOAD DEFAULT LOCATION
  // -----------------------------
  const location = await db.location.findFirst({
    where: { isDefault: true },
  });

  if (!location) {
    return <div>No default location configured.</div>;
  }

  // -----------------------------
  // LOAD LATEST WEATHER SNAPSHOT
  // -----------------------------
  const latestWeather = await db.weatherSnapshot.findFirst({
    where: { locationId: location.id },
    orderBy: { fetchedAt: "desc" },
  });

  // Optional logging
  await logit(
    "jonathan",
    {
      level: "info",
      message: "Loaded latest weather snapshot",
      payload: {
        hasWeather: !!latestWeather,
        locationId: location.id,
      },
    },
    ctx
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-600 to-sky-900 text-white p-8">
      <div className="max-w-5xl mx-auto bg-sky-800/60 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">

        {/* Header */}
        <section className="mb-8">
          <h1 className="text-4xl font-semibold mb-1">
            {getGreeting()}, Jonathan.
          </h1>
          <p className="text-sky-200">
            Your weather system is online and running smoothly.
          </p>
        </section>

        {/* Current Weather */}
        {latestWeather ? (
          <section className="mt-6 p-4 bg-sky-700/40 rounded-xl border border-white/10">
            <h2 className="text-xl font-medium mb-3 text-sky-200">
              Current Weather
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sky-100">
              <div>Temperature: {latestWeather.temperature}°F</div>
              <div>Feels Like: {latestWeather.feelsLike ?? "—"}°F</div>
              <div>Humidity: {latestWeather.humidity ?? "—"}%</div>
              <div>Wind: {latestWeather.windSpeed ?? "—"} mph</div>
              <div>Pressure: {latestWeather.pressure ?? "—"} hPa</div>
              <div>Visibility: {latestWeather.visibility ?? "—"} mi</div>
              <div>Weather Code: {latestWeather.weatherCode ?? "—"}</div>
              <div className="text-sky-300 text-sm">
                Updated: {latestWeather.fetchedAt.toLocaleString()}
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-6 text-sky-200">
            No weather data available yet.
          </section>
        )}

        {/* System Health */}
        <section className="mt-10">
          <h2 className="text-xl font-medium mb-2 text-sky-200">
            System Health
          </h2>
        </section>

        {/* Recent Activity */}
        <section className="mt-6">
          <h2 className="text-xl font-medium mb-2 text-sky-200">
            <RecentActivity />
          </h2>
        </section>

        {/* Quick Actions */}
        <section className="mt-8 flex gap-4">
          <Button asChild>
            <Link href="/forecast">Full Forecast</Link>
          </Button>
          <Button asChild>
            <Link href="/logs">Logs</Link>
          </Button>
          <Button asChild>
            <Link href="/api/prisma-test">Prisma Test</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
