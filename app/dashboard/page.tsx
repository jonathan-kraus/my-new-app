/*
 * @FilePath: \my-new-app\app\dashboard\page.tsx
 * @LastEditTime: 2026-09-03 19:24:12
 */

// app/dashboard/page.tsx
import { getDashboardData } from "@/lib/dashboard";
import { getFullPackageData } from "@/lib/version/get-full-package-data";
import { AstronomyCard } from "@/app/astronomy/AstronomyCard";
import CurrentWeatherCard from "@/app/components/dashboard/current-weather-card";
import VersionCard from "@/app/components/dashboard/version-card";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import type { Metadata } from "next";
import { auth } from "@/auth";
import BuildCard from "../components/dashboard/build-card";
import { db } from "@/lib/db";
import { LocationSchema, WeatherSchema } from "@/lib/schemas/page-schemas";
import { LogsCard } from "./components/LogsCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard " };
let jei = 0;

function nowMs() {
  const [s, ns] = process.hrtime();
  return s * 1_000 + ns / 1_000_000;
}

function hrElapsed(start: number) {
  const elapsed = nowMs() - start;
  return `${elapsed.toFixed(1)} ms`;
}

export default async function DashboardPage(req: Request) {
  const pageStart = nowMs();
  const built = buildUniversalContext(req as any, "DASHBOARD");
  const session = await auth();
  const verbose = Math.random() < 0.1; // (sample ~10% of requests)
  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page loaded",
    file: "app/dashboard/page.tsx",
    line: 45,
    payload: { title: metadata.title, a: "b", user: session?.user },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // Phase 1: Data fetching
  const dataStart = nowMs();
  const data = await getDashboardData();
  const location = await db.location.findFirst({
    where: { isDefault: true },
  });
  LocationSchema.parse(location);
  if (!location) {
    return <div>No default location configured.</div>;
  }
  let weather: any = null;

  try {
    const weatherRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather?locationId=${location.id}`,
      { cache: "no-store" },
    );

    if (!weatherRes.ok) {
      throw new Error(`Weather API returned ${weatherRes.status}`);
    }

    const raw = await weatherRes.json();
    console.log("Raw weather data:", raw);
    await logj({
      domain: "dashboard",
      level: "info",
      message: "Dashboard received weather data from API...",
      file: "app/dashboard/page.tsx",
      line: 79,
      payload: { "Raw weather data": raw },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    WeatherSchema.parse(raw);
    weather = raw;
  } catch (err) {
    console.error("Weather API failed:", err);
    weather = null;
  }

  const dataElapsed = hrElapsed(dataStart);
  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page data fetched",
    file: "app/dashboard/page.tsx",
    line: 96,
    payload: { data: data, elapsed: dataElapsed },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // Phase 2: Build tool entries
  const toolStart = nowMs();
  const fullPackageData = getFullPackageData();

  const importantTools = data.build?.tools ?? {
    node: "unknown",
    pnpm: "unknown",
    next: "unknown",
    typescript: "unknown",
    eslint: "unknown",
    openmeteo: "unknown",
    prisma: "unknown",
  };

  const IGNORE = [
    /^@radix-ui\//,
    /^@types\//,
    /^@typescript-eslint\//,
    // add more patterns you don't want to track
  ];

  const fullTools: Record<string, string> = {
    ...fullPackageData.dependencies,
    ...fullPackageData.devDependencies,
    ...(fullPackageData.overrides ?? {}),
  };

  const toolEntries = Object.entries(fullTools)
    .filter(([name]) => !IGNORE.some((re) => re.test(name)))
    .map(([name, version]) => ({
      name,
      version: String(version),
    }));

  const toolElapsed = hrElapsed(toolStart);
  if (verbose) {
    await logj({
      domain: "dashboard",
      level: "info",
      message: `Built ${toolEntries.length} tool entries`,
      file: "app/dashboard/page.tsx",
      line: 142,
      payload: { count: toolEntries.length, elapsed: toolElapsed },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
  }

  // Phase 3: Database operations (batched)
  const dbStart = nowMs();
  if (toolEntries.length > 0) {
    const names = toolEntries.map((t) => t.name);
    const existing = await db.toolVersion.findMany({
      where: { name: { in: names } },
    });
    const existingMap: Record<string, any> = Object.fromEntries(
      existing.map((e) => [e.name, e]),
    );

    const toCreate: any[] = [];
    const verifyNames: string[] = [];
    const toChange: { name: string; version: string; current: any }[] = [];

    for (const { name, version } of toolEntries) {
      const current = existingMap[name];
      if (!current) {
        toCreate.push({
          name,
          version,
          added_at: new Date(),
          verified_at: new Date(),
        });
      } else if (current.version === version) {
        verifyNames.push(name);
      } else {
        toChange.push({ name, version, current });
      }
    }

    await db.$transaction(async (tx) => {
      // Create new entries
      if (toCreate.length > 0) {
        await tx.toolVersion.createMany({
          data: toCreate,
          skipDuplicates: true,
        });
      }

      // Update verified_at for unchanged versions
      if (verifyNames.length > 0) {
        await tx.toolVersion.updateMany({
          where: { name: { in: verifyNames } },
          data: { verified_at: new Date() },
        });

        if (verbose) {
          await logj({
            domain: "dashboard",
            level: "info",
            message: `Verified ${verifyNames.length} tool versions`,
            file: "app/dashboard/page.tsx",
            line: 201,
            payload: { count: verifyNames.length },
            meta: { built: { ...built, eventIndex: ++jei } },
          });
        }
      }

      // Handle version changes
      for (const { name, version, current } of toChange) {
        const baseName = `base${name}`;

        await logj({
          domain: "dashboard",
          level: "info",
          message: `New Version ${name} →→ ${version}`,
          file: "app/dashboard/page.tsx",
          line: 217,
          payload: {
            name,
            baseName,
            oldVersion: current.version,
            newVersion: version,
            added: current.added_at,
          },
          meta: { built: { ...built, eventIndex: ++jei } },
        });

        await tx.toolVersion.upsert({
          where: { name: baseName },
          create: {
            name: baseName,
            version: current.version, // old version
            added_at: current.added_at,
            verified_at: new Date(),
          },
          update: {
            version: current.version, // old version
            verified_at: new Date(),
          },
        });

        await tx.toolVersion.update({
          where: { name },
          data: {
            version,
            added_at: new Date(),
            verified_at: new Date(),
          },
        });
      }
    });
  }

  const dbElapsed = hrElapsed(dbStart);
  await logj({
    domain: "dashboard",
    level: "info",
    message: "Database sync complete",
    file: "app/dashboard/page.tsx",
    line: 260,
    payload: {
      elapsed: dbElapsed,
      toCreate: toolEntries.length > 0 ? "batched" : "skipped",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // Phase 4: Fetch logs
  const logsStart = nowMs();
  const logs = await db.log.findMany({
    orderBy: { created_at: "desc" },
    take: 50,
  });
  const logsElapsed = hrElapsed(logsStart);

  const totalElapsed = hrElapsed(pageStart);
  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page render complete",
    file: "app/dashboard/page.tsx",
    line: 282,
    payload: {
      total: totalElapsed,
      phases: {
        data: dataElapsed,
        tools: toolElapsed,
        database: dbElapsed,
        logs: logsElapsed,
      },
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      <AstronomyCard data={data.astronomy} />
      {/* Small curated tools still available if you want them */}
      <BuildCard build={{ ...data.build, tools: importantTools }} />
      <CurrentWeatherCard location={location} />
      <VersionCard />
      <LogsCard logs={logs} />
    </div>
  );
}
