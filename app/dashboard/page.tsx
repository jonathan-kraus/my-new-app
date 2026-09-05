/*
 * @FilePath: \my-new-app\app\dashboard\page.tsx
 * @LastEditTime: 2026-09-05 14:34:27
 */

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
  const verbose = Math.random() < 0.1; // sample ~10% of requests

  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page loaded",
    file: "app/dashboard/page.tsx",
    line: 40,
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
      line: 74,
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
    line: 91,
    payload: { data: data, elapsed: dataElapsed },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // Phase 2: Build tool entries from package.json
  const toolStart = nowMs();

  const IGNORE_PREFIXES = [
    "@radix-ui/",
    "@types/",
    "@typescript-eslint/",
    "eslint",
    "typescript",
    "ts-node",
    "vite",
    "vitest",
    "tailwindcss",
    "postcss",
    "autoprefixer",
  ];

  const IGNORE_ROOT_FIELDS = [
    "name",
    "version",
    "private",
    "packageManager",
    "type",
    "vercel-build-id",
    "overrides",
  ];

  const fullPackageData = await getFullPackageData();

  const cleanRoot = Object.fromEntries(
    Object.entries(fullPackageData).filter(
      ([key]) => !IGNORE_ROOT_FIELDS.includes(key),
    ),
  );

  const fullDeps = {
    ...(fullPackageData.dependencies ?? {}),
    ...(fullPackageData.devDependencies ?? {}),
  };

  const filteredDeps = Object.fromEntries(
    Object.entries(fullDeps).filter(
      ([name]) => !IGNORE_PREFIXES.some((prefix) => name.startsWith(prefix)),
    ),
  );

  const toolEntries = Object.entries(filteredDeps).map(([name, version]) => ({
    name,
    version: String(version),
  }));
  // Inject pnpm from build metadata so DB tracks the real version
  if (data.build?.tools?.pnpm) {
    toolEntries.push({
      name: "pnpm",
      version: data.build.tools.pnpm,
    });
  }

  const envPayload = {
    buildTime: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    dependencies: filteredDeps,
    meta: cleanRoot,
  };

  const toolElapsed = hrElapsed(toolStart);
  if (verbose) {
    await logj({
      domain: "dashboard",
      level: "info",
      message: `Built ${toolEntries.length} tool entries`,
      file: "app/dashboard/page.tsx",
      line: 144,
      payload: {
        count: toolEntries.length,
        elapsed: toolElapsed,
        envPayload,
      },
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
      if (toCreate.length > 0) {
        await tx.toolVersion.createMany({
          data: toCreate,
          skipDuplicates: true,
        });
      }

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
            line: 203,
            payload: { count: verifyNames.length },
            meta: { built: { ...built, eventIndex: ++jei } },
          });
        }
      }

      for (const { name, version, current } of toChange) {
        const baseName = `base${name}`;

        await logj({
          domain: "dashboard",
          level: "info",
          message: `New Version ${name} →→ ${version}`,
          file: "app/dashboard/page.tsx",
          line: 219,
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
            version: current.version,
            added_at: current.added_at,
            verified_at: new Date(),
          },
          update: {
            version: current.version,
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
    line: 262,
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
    line: 284,
    payload: {
      total: totalElapsed,
      phases: {
        data: dataElapsed,
        tools: toolElapsed,
        database: dbElapsed,
        logs: logsElapsed,
      },
      envPayload,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // Curated tools for BuildCard (you can refine this selection)
  const importantTools = data.build?.tools ?? {
    node: filteredDeps.node ?? "unknown",
    pnpm: filteredDeps.pnpm ?? "unknown",
    next: filteredDeps.next ?? "unknown",
    typescript: filteredDeps.typescript ?? "unknown",
    eslint: filteredDeps.eslint ?? "unknown",
    openmeteo: filteredDeps.openmeteo ?? "unknown",
    prisma: filteredDeps["@prisma/adapter-pg"] ?? "unknown",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      <AstronomyCard data={data.astronomy} />
      <BuildCard build={{ ...data.build, tools: importantTools }} />
      <CurrentWeatherCard location={location} />
      <VersionCard />
      <LogsCard logs={logs} />
    </div>
  );
}
