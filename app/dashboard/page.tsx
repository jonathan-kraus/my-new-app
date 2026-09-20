/*
 * @FilePath: \my-new-app\app\dashboard\page.tsx
 * @LastEditTime: 2026-09-18 00:06:27
 */

import { getDashboardData } from "@/lib/dashboard";
import { getFullPackageData } from "@/lib/version/get-full-package-data";
import { AstronomyCard } from "@/app/astronomy/AstronomyCard";
import CurrentWeatherCard from "@/app/components/dashboard/current-weather-card";
import VersionCard from "@/app/components/dashboard/version-card";
import { logj } from "@/lib/log/logj";
import { timestampString } from "@/lib/timestampString";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import type { Metadata } from "next";
import { auth } from "@/auth";
import BuildCard from "../components/dashboard/build-card";
import { LocationSchema, WeatherSchema } from "@/lib/schemas/page-schemas";
import { LogsCard } from "./components/LogsCard";
import { db8 } from "@/lib/db.prisma8";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard " };

function nowMs() {
  const [s, ns] = process.hrtime();
  return s * 1_000 + ns / 1_000_000;
}

function hrElapsed(start: number) {
  const elapsed = nowMs() - start;
  return `${elapsed.toFixed(1)} ms`;
}

export default async function DashboardPage(req: Request) {
  let jei = 0;
  const pageStart = nowMs();
  const built = buildUniversalContext(req, "DASHBOARD");
  const session = await auth();
  // eslint-disable-next-line react-hooks/purity -- Sample request logs in this dynamic server page.
  const verbose = Math.random() < 0.1; // sample ~10% of requests

  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page loaded",
    file: "app/dashboard/page.tsx",
    line: 42,
    payload: { title: metadata.title, a: "b", user: session?.user },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // Phase 1: Data fetching
  const dataStart = nowMs();
  const data = await getDashboardData();
  const location = await db8.orm.public.Location.where({
    isDefault: true,
  }).first();

  if (!location) {
    return <div>No default location configured.</div>;
  }

  LocationSchema.parse(location);

  const weatherLocation = {
    ...location,
    createdAt: new Date(location.createdAt),
    updatedAt: new Date(location.updatedAt),
  };

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
      line: 83,
      payload: { "Raw weather data": raw },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    WeatherSchema.parse(raw);
  } catch (err) {
    console.error("Weather API failed:", err);
  }

  const dataElapsed = hrElapsed(dataStart);
  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page data fetched",
    file: "app/dashboard/page.tsx",
    line: 98,
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
      line: 175,
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
    const existing = await db8.orm.public.ToolVersion.where((tool) =>
      tool.name.in(names),
    ).all();
    const existingMap: Record<string, (typeof existing)[number]> =
      Object.fromEntries(existing.map((e) => [e.name, e]));

    const toCreate: Parameters<
      typeof db8.orm.public.ToolVersion.createAll
    >[0][number][] = [];
    const verifyNames: string[] = [];
    const toChange: {
      name: string;
      version: string;
      current: (typeof existing)[number];
    }[] = [];

    for (const { name, version } of toolEntries) {
      const current = existingMap[name];
      if (!current) {
        toCreate.push({
          name,
          version,
          addedAt: timestampString(new Date().toISOString()),
          verifiedAt: timestampString(new Date().toISOString()),
        });
      } else if (current.version === version) {
        verifyNames.push(name);
      } else {
        toChange.push({ name, version, current });
      }
    }

    await db8.transaction(async (tx) => {
      if (toCreate.length > 0) {
        await tx.orm.public.ToolVersion.createAll(toCreate);
      }

      if (verifyNames.length > 0) {
        for (const name of verifyNames) {
          await tx.orm.public.ToolVersion.where({
            name,
          }).update({
            verifiedAt: timestampString(new Date().toISOString()),
          });
        }

        if (verbose) {
          await logj({
            domain: "dashboard",
            level: "info",
            message: `Verified ${verifyNames.length} tool versions`,
            file: "app/dashboard/page.tsx",
            line: 242,
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
          line: 257,
          payload: {
            name,
            baseName,
            oldVersion: current.version,
            newVersion: version,
            added: current.addedAt,
          },
          meta: { built: { ...built, eventIndex: ++jei } },
        });
        const now = timestampString(new Date().toISOString());
        await tx.orm.public.ToolVersion.upsert({
          create: {
            name: baseName,
            version: current.version,
            addedAt: current.addedAt,
            verifiedAt: now,
          },
          update: {
            version: current.version,
            verifiedAt: now,
          },
          conflictOn: {
            name: baseName,
          },
        });

        await tx.orm.public.ToolVersion.where({
          name,
        }).update({
          version,
          addedAt: timestampString(new Date().toISOString()),
          verifiedAt: timestampString(new Date().toISOString()),
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
    line: 301,
    payload: {
      elapsed: dbElapsed,
      toCreate: toolEntries.length > 0 ? "batched" : "skipped",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // Phase 4: Fetch logs
  const logsStart = nowMs();
  const logs = await db8.orm.public.Log.orderBy((log) => log.createdAt.desc())
    .limit(50)
    .all();
  const logsElapsed = hrElapsed(logsStart);

  const totalElapsed = hrElapsed(pageStart);
  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page render complete",
    file: "app/dashboard/page.tsx",
    line: 322,
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
    prisma: filteredDeps["@prisma/orm-postgres"] ?? "unknown",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      <AstronomyCard data={data.astronomy} />
      <BuildCard build={{ ...data.build, tools: importantTools }} />
      <CurrentWeatherCard location={weatherLocation} />
      <VersionCard />
      <LogsCard logs={logs} />
    </div>
  );
}
