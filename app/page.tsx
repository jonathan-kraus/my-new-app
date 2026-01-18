// app/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logit } from "@/lib/log/server";
import { Button } from "@/components/ui/button";
import CurrentWeatherCard from "@/app/components/dashboard/current-weather-card";
import { AstronomyCard } from "@/app/astronomy/AstronomyCard";
import Link from "next/link";
import { db } from "@/lib/db";
import { RecentActivity } from "@/components/activity/RecentActivity";
import { loadAstronomySnapshots } from "./astronomy/loader";

{
  /* <div>🌙 Moonrise: {format(data.moonrise)}</div> */
}
// <div>🌘 Moonset: {format(data.moonset)}</div>
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}


export default async function HomePage() {
  const h = await headers(); // ✅ await the Promise
  const session = await auth.api.getSession({
    headers: Object.fromEntries(h.entries()),
  });
  const { today, tomorrow } = await loadAstronomySnapshots();

console.log("HOMEPAGE TODAY:", today);
console.log("HOMEPAGE TOMORROW:", tomorrow);

  await logit({
    level: "info",
    message: "Visited dashboard",
    data: {
      sessionUser: session?.user?.name ?? null,
      sessionEmail: session?.user?.email ?? null,
      userId: session?.user?.id ?? null,
      session: session ?? null,
    },
  });

  const location = await db.location.findFirst({
    where: { isDefault: true },
  });
  if (!location) {
    return <div>No default location configured.</div>;
  }
  const weatherRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather?locationId=${location?.id}`,
    { cache: "no-store" },
  );
  const weatherData = await weatherRes.json();
    await logit({
    level: "info",
    message: "Visited dashboard",
    data: {
      weatherData: weatherData,
      sessionEmail: session?.user?.email ?? null,
      userId: session?.user?.id ?? null,
      session: session ?? null,
    },
  });
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
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CurrentWeatherCard location={location} />
          <AstronomyCard today={today} tomorrow={tomorrow} />
        </section>

        {/* System Health */}
        <section className="mt-10">
          <h2 className="text-xl font-medium mb-2 text-sky-200">
            System Health
          </h2>
        </section>

        {/* Runtime Controls */}
        <section className="mt-6">
          <h2 className="text-xl font-medium mb-2 text-sky-200">
            Runtime Controls
          </h2>
        </section>

        {/* Recent Activity */}
        <section className="mt-6">
          <h2 className="text-xl font-medium mb-2 text-sky-200">
            {<RecentActivity />}
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
          <Button asChild>
            <Link href="/admin/runtime">Runtime Settings</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
