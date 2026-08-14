/*
 * @FilePath: \my-new-app\app\page.tsx
 * @LastEditTime: 2026-08-13 21:25:45
 */

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
import { headers, cookies } from "next/headers";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage(req: Request) {
  // ---------------------------
  // DASHBOARD TIMING START
  // ---------------------------
  const dashboardStart = performance.now();

  // ---------------------------
  // SESSION TIMING
  // ---------------------------
  const sessionStart = performance.now();
  const session = await auth();
  const sessionEnd = performance.now();

  const parsed = SessionSchema.safeParse(session);
  if (!parsed.success) {
    return <div>Invalid session.</div>;
  }

  // ---------------------------
  // UNIVERSAL CONTEXT TIMING
  // ---------------------------
  const contextStart = performance.now();
  const built = await buildUniversalContext(req as any, "DASHBOARD");
  const contextEnd = performance.now();

  let jei = 0;

  await logj({
    domain: "jonathan",
    level: "info",
    message: `** Dashboard Start **`,
    file: "app/page.tsx",
    line: 57,
    payload: { some: "data" },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // ---------------------------
  // DB TIMING
  // ---------------------------
  const dbStart = performance.now();
  const location = await db.location.findFirst({
    where: { isDefault: true },
  });
  const dbEnd = performance.now();

  LocationSchema.parse(location);

  if (!location) {
    return <div>No default location configured.</div>;
  }

  // ---------------------------
  // BASE URL
  // ---------------------------
  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const base = `${protocol}://${host}`;

  // ---------------------------
  // WEATHER TIMING
  // ---------------------------
  const weatherStart = performance.now();
  const weatherRes = await fetch(
    `${base}/api/weather?locationId=${location.id}`,
    {
      cache: "no-store",
    },
  );

  let weatherData;
  try {
    weatherData = await weatherRes.json();
  } catch (err) {
    const raw = await weatherRes.text().catch(() => "Could not read body");
    await logj({
      domain: "weather",
      level: "error",
      message: "weatherRes.json() failed",
      file: "app/page.tsx",
      line: 106,
      payload: {
        error: String(err),
        body: raw,
        url: weatherRes.url,
        status: weatherRes.status,
        redirected: weatherRes.redirected,
      },
    });
    return <div>Weather data could not be parsed.</div>;
  }
  const weatherEnd = performance.now();

  WeatherSchema.parse(weatherData);

  // ---------------------------
  // FORECAST TIMING
  // ---------------------------
  const forecastStart = performance.now();
  const forecastRes = await fetch(
    `${base}/api/weather/forecast?locationId=${location.id}`,
    {
      cache: "no-store",
    },
  );

  let forecastData;
  try {
    forecastData = await forecastRes.json();
  } catch (err) {
    const raw = await forecastRes.text().catch(() => "Could not read body");
    await logj({
      domain: "forecast",
      level: "error",
      message: "forecastRes.json() failed",
      file: "app/page.tsx",
      line: 142,
      payload: {
        error: String(err),
        body: raw,
        url: forecastRes.url,
        status: forecastRes.status,
        redirected: forecastRes.redirected,
      },
    });
    return <div>Forecast data could not be parsed.</div>;
  }
  const forecastEnd = performance.now();
  // ---------------------------
  // GIT ACTIVITY TIMING
  // ---------------------------
  const gitStart = performance.now();
  const gitRes = await fetch(`${base}/api/activity/github`, {
    cache: "no-store",
  });

  let gitData;
  try {
    gitData = await gitRes.json();
  } catch (err) {
    const raw = await gitRes.text().catch(() => "Could not read body");
    await logj({
      domain: "git",
      level: "error",
      message: "gitRes.json() failed",
      file: "app/page.tsx",
      line: 172,
      payload: {
        error: String(err),
        body: raw,
        url: gitRes.url,
        status: gitRes.status,
        redirected: gitRes.redirected,
      },
    });
    return <div>Git activity could not be parsed.</div>;
  }

  const gitEnd = performance.now();
  const gitDurationMs = gitEnd - gitStart;

  // ---------------------------
  // DASHBOARD TIMING END
  // ---------------------------
  const dashboardEnd = performance.now();

  // ---------------------------
  // LOG FULL TIMING BREAKDOWN
  // ---------------------------
  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard timing",
    file: "app/page.tsx",
    line: 200,
    payload: {
      dashboardDurationMs: dashboardEnd - dashboardStart,
      sessionDurationMs: sessionEnd - sessionStart,
      contextDurationMs: contextEnd - contextStart,
      dbDurationMs: dbEnd - dbStart,
      weatherDurationMs: weatherEnd - weatherStart,
      forecastDurationMs: forecastEnd - forecastStart,
      gitDurationMs: gitDurationMs,
    },
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-600 to-sky-900 text-white p-8">
      <div className="max-w-5xl mx-auto bg-sky-800/60 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">
        <section className="mb-8">
          <h1 className="text-4xl font-semibold mb-1">
            {getGreeting()}, Jonathan.
          </h1>
          <p className="text-sky-400">
            Your system is online and running smoothly.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CurrentWeatherCard location={location} />
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-medium mb-2 text-sky-200">
            System Health
          </h2>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-medium mb-2 text-sky-200">
            <RecentActivity />
          </h2>
        </section>

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
