/*
 * @FilePath: \my-new-app\app\page.tsx
 * @LastEditTime: 2026-08-13 18:50:52
 */
// app/page.tsx
import { auth } from "@/auth";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { Button } from "@/components/ui/button";
import { UIProvider } from "@/components/providers/ui-provider";
import CurrentWeatherCard from "@/app/components/dashboard/current-weather-card";
import Link from "next/link";
import { db } from "@/lib/db";
import { RecentActivity } from "@/components/activity/RecentActivity";
import {
  SessionSchema,
  LocationSchema,
  WeatherSchema,
} from "@/lib/schemas/page-schemas";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage(req: Request) {
  // If you still need the full session object for richer logging, fetch it here
  const session = await auth();
  const parsed = SessionSchema.safeParse(session);
  if (!parsed.success) {
    return <div>Invalid session.</div>;
  }
  // Use userId from the universal context if available, otherwise fall back to session
  const built = await buildUniversalContext(req as any, "DASHBOARD");
  let jei = 0;
  await logj({
    domain: "jonathan",
    level: "info",
    message: `** Dashboard Start **`,
    file: "app/page.tsx",
    line: 39,
    payload: {
      some: "data",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const location = await db.location.findFirst({
    where: { isDefault: true },
  });
  LocationSchema.parse(location);
  if (!location) {
    return <div>No default location configured.</div>;
  }
  const weatherRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather?locationId=${location.id}`,
    { cache: "no-store" },
  );

  // 1. Handle network errors
  if (!weatherRes.ok) {
    await logj({
      domain: "weather",
      level: "error",
      message: "weatherRes not ok",
      file: "app/page.tsx",
      line: 65,
      payload: { status: weatherRes.status },
    });

    return <div>Weather service unavailable.</div>;
  }

  let weatherData;

  // 2. Handle invalid JSON
  try {
    weatherData = await weatherRes.json();
  } catch (err) {
    await logj({
      domain: "weather",
      level: "error",
      message: "weatherRes.json() failed",
      file: "app/page.tsx",
      line: 83,
      payload: { error: String(err) },
    });

    return <div>Weather data could not be parsed.</div>;
  }

  // 3. Handle schema validation errors
  try {
    WeatherSchema.parse(weatherData);
  } catch (err) {
    await logj({
      domain: "weather",
      level: "error",
      message: "WeatherSchema.parse failed",
      file: "app/page.tsx",
      line: 99,
      payload: { error: String(err) },
    });

    return <div>Weather data is invalid.</div>;
  }

  await logj({
    domain: "jonathan",
    level: "info",
    message: "weatherData retrieved",
    file: "app/page.tsx",
    line: 111,
    payload: { some: "data" },

    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const forecastRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather/forecast?locationId=${location?.id}`,
    { cache: "no-store" },
  );
  const forecastData = await forecastRes.json();
  await logj({
    domain: "jonathan",
    level: "info",
    message: `*** Dashboard End ***`,
    file: "app/page.tsx",
    line: 127,
    payload: {
      location: location,
      weatherData: weatherData,
      forecastData: forecastData,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-600 to-sky-900 text-white p-8">
      <div className="max-w-5xl mx-auto bg-sky-800/60 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">
        {/* Header */}
        <section className="mb-8">
          <h1 className="text-4xl font-semibold mb-1">
            {getGreeting()}, Jonathan.
          </h1>
          <p className="text-sky-400">
            Your system is online and running smoothly.
          </p>
        </section>

        {/* Current Weather */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CurrentWeatherCard location={location} />
        </section>

        {/* System Health */}
        <section className="mt-10">
          <h2 className="text-xl font-medium mb-2 text-sky-200">
            System Health
          </h2>
        </section>

        {/* Recent Activity */}
        <section className="mt-6">
          <h2 className="text-xl font-medium mb-2 text-sky-200">
            {/* {<RecentActivity />} */}
          </h2>
        </section>

        {/* Quick Actions */}
        <UIProvider>
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
        </UIProvider>
      </div>
    </div>
  );
}
