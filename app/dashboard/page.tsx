// app/dashboard/page.tsx
import { getDashboardData } from "@/lib/dashboard";
import { getFullPackageData } from "@/lib/version/get-full-package-data";
import { AstronomyCard } from "@/app/astronomy/AstronomyCard";
import CurrentWeatherCard from "@/app/components/dashboard/current-weather-card";
import VersionCard from "@/app/components/dashboard/version-card";
import { logj } from "@/lib/log/client";
import { staticUniversalContext } from "@/lib/log/buildj";
import type { Metadata } from "next";
import { auth } from "@/auth";
import BuildCard from "../components/dashboard/build-card";
import { db } from "@/lib/db";
import { LocationSchema, WeatherSchema } from "@/lib/schemas/page-schemas";
import { getWeatherForLocation } from "@/lib/weather/get-weather";
import type { z } from "zod";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard " };

// Precompile ignore regexes once at module load
const IGNORE_PATTERNS = [
  /^@radix-ui\//,
  /^@types\//,
  /^@typescript-eslint\//,
] as const;

type Location = z.infer<typeof LocationSchema>;
type Weather = z.infer<typeof WeatherSchema>;

export default async function DashboardPage() {
  // Request-scoped counter (avoid shared mutable module state)
  let eventIndex = 0;

  const built = staticUniversalContext("DASHBOARD");

  // Authenticate early (server-side)
  const session = await auth();
  const userId = session?.user?.id ?? null;

  // Sample verbose logging ~10%
  const verbose = Math.random() < 0.1;

  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page loaded",
    file: "app/dashboard/page.tsx",
    line: 28,
    // Avoid logging entire user object — keep only an identifier
    payload: { title: metadata.title, userId },
    meta: { built: { ...built, eventIndex: ++eventIndex } },
  });

  // Run independent reads concurrently
  const [data, locationRes] = await Promise.all([
    getDashboardData(),
    db.location.findFirst({ where: { isDefault: true } }),
  ]);

  // Validate location exists before parsing schema
  if (!locationRes) {
    return <div>No default location configured.</div>;
  }
  // Parse/validate shape (throws if invalid)
  LocationSchema.parse(locationRes);
  const location = locationRes as Location;

  // Fetch weather for the default location (server-side)
  let weather: Weather | null = null;
  try {
    const weatherResult = await getWeatherForLocation(location.id);
    weather = weatherResult as unknown as Weather;

    await logj({
      domain: "dashboard",
      level: "info",
      message: "Dashboard received weather data (internal)",
      file: "app/dashboard/page.tsx",
      line: 60,
      payload: { locationId: location.id },
      meta: { built: { ...built, eventIndex: ++eventIndex } },
    });
  } catch (err) {
    // Keep rendering even if weather fetch fails
    console.error("Weather API failed:", err);
    weather = null;
  }

  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page data fetched",
    file: "app/dashboard/page.tsx",
    line: 76,
    payload: { userId, dataSummary: { build: !!data.build, astronomy: !!data.astronomy } },
    meta: { built: { ...built, eventIndex: ++eventIndex } },
  });

  // 1. Full package data
  const fullPackageData = getFullPackageData();

  // 2. Curated important tools
  const importantTools = data.build?.tools ?? {
    node: "unknown",
    pnpm: "unknown",
    next: "unknown",
    typescript: "unknown",
    eslint: "unknown",
    openmeteo: "unknown",
    prisma: "unknown",
  };

  // 3. Build the list that will be examined/written to the database
  const fullTools: Record<string, string> = {
    ...fullPackageData.dependencies,
    ...fullPackageData.devDependencies,
    ...(fullPackageData.overrides ?? {}),
  };

  const toolEntries = Object.entries(fullTools)
    .filter(([name]) => !IGNORE_PATTERNS.some((re) => re.test(name)))
    .map(([name, version]) => ({ name, version: String(version) }));

  // 4. Batch DB operations for toolVersion (reduce round-trips)
  if (toolEntries.length > 0) {
    try {
      const toolNames = toolEntries.map((t) => t.name);
      const baseNames = toolNames.map((n) => `base${n}`);
      const namesToLookup = Array.from(new Set([...toolNames, ...baseNames]));

      // Fetch any existing rows for these names (including base* entries)
      const existing = await db.toolVersion.findMany({
        where: { name: { in: namesToLookup } },
      });

      const existingByName = new Map(existing.map((r) => [r.name, r]));

      // Prepare transactional operations
      const ops: Promise<any>[] = [];
      const createManyData: Array<{ name: string; version: string; added_at: Date; verified_at: Date }> = [];

      for (const { name, version } of toolEntries) {
        const current = existingByName.get(name);

        // New tool — create later via createMany
        if (!current) {
          createManyData.push({
            name,
            version,
            added_at: new Date(),
            verified_at: new Date(),
          });
          continue;
        }

        // Same version → just update verified_at
        if (current.version === version) {
          ops.push(
            db.toolVersion.update({
              where: { name },
              data: { verified_at: new Date() },
            }),
          );
          continue;
        }

        // Version changed: ensure there is a base entry for the old version, then update the main row
        const baseName = `base${name}`;
        // Upsert base entry to preserve previous version
        ops.push(
          db.toolVersion.upsert({
            where: { name: baseName },
            create: {
              name: baseName,
              version: current.version, // old version
              added_at: current.added_at ?? new Date(),
              verified_at: new Date(),
            },
            update: {
              version: current.version,
              verified_at: new Date(),
            },
          }),
        );

        // Update the main name to the new version
        ops.push(
          db.toolVersion.update({
            where: { name },
            data: {
              version,
              added_at: new Date(),
              verified_at: new Date(),
            },
          }),
        );

        if (verbose) {
          await logj({
            domain: "dashboard",
            level: "info",
            message: `New Version ${name} → ${version}`,
            file: "app/dashboard/page.tsx",
            payload: { name, oldVersion: current.version, newVersion: version, userId },
            meta: { built: { ...built, eventIndex: ++eventIndex } },
          });
        }
      }

      // Prepend createMany if there are new tools
      if (createManyData.length > 0) {
        // createMany cannot be mixed with other operations in one transaction if using some databases,
        // but on Prisma with supported DBs it is allowed in $transaction. We still push it first.
        ops.unshift(
          db.toolVersion.createMany({
            data: createManyData,
            skipDuplicates: true,
          }),
        );
      }

      if (ops.length > 0) {
        // Execute all writes in a single transaction
        await db.$transaction(ops);
      }
    } catch (err) {
      // Non-fatal: log and continue rendering. DB writes are helpful but not required for the page.
      console.error("Failed to sync tool versions:", err);
      await logj({
        domain: "dashboard",
        level: "warn",
        message: "Failed to sync tool versions",
        file: "app/dashboard/page.tsx",
        line: 230,
        payload: { error: String((err as Error)?.message ?? err), userId },
        meta: { built: { ...built, eventIndex: ++eventIndex } },
      });
    }
  }

  // 5. Fetch recent logs (read-only)
  const logs = await db.log.findMany({
    orderBy: { created_at: "desc" },
    take: 50,
  });

  // 6. Render the dashboard
  // Note: CurrentWeatherCard receives location and (optionally) server-fetched weather.
  // If CurrentWeatherCard doesn't accept a `weather` prop yet, you can remove it and let the card fetch itself.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      <AstronomyCard data={data.astronomy} />
      <BuildCard build={{ ...data.build, tools: importantTools }} />
      <CurrentWeatherCard location={location} weather={weather} />
      <VersionCard />
      <LogsCard logs={logs} />
    </div>
  );
}
