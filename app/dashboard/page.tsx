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

//import { GitHubCard } from "./components/GitHubCard";
//import { WeatherCard } from "./components/WeatherCard";
import { LogsCard } from "./components/LogsCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard " };
let jei = 0;

export default async function DashboardPage(req: Request) {
  const built = await buildUniversalContext(req as any, "DASHBOARD");
  const session = await auth();
  // run verbose logs only sometimes (sample ~10% of requests)
  const verbose = Math.random() < 0.1;
  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page loaded",
    file: "app/dashboard/page.tsx",
    line: 28,
    payload: { title: metadata.title, a: "b", user: session?.user },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

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
      line: 60,
      payload: { "Raw weather data": raw },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    WeatherSchema.parse(raw);
    weather = raw;
  } catch (err) {
    console.error("Weather API failed:", err);
    weather = null;
  }

  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page data fetched",
    file: "app/dashboard/page.tsx",
    line: 76,
    payload: { data: data },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // 1. Full data that will be given to VercelCard AND the DB loop
  // ---------------------------------------------------------------
  const fullPackageData = getFullPackageData();

  // ---------------------------------------------------------------
  // 2. Small curated list (still available for other cards / UI)
  // ---------------------------------------------------------------
  const importantTools = data.build?.tools ?? {
    node: "unknown",
    pnpm: "unknown",
    next: "unknown",
    typescript: "unknown",
    eslint: "unknown",
    openmeteo: "unknown",
    prisma: "unknown",
  };

  // ---------------------------------------------------------------
  // 3. Build the list that will be written to the database
  //    (full list + optional filtering)
  // ---------------------------------------------------------------
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

  // ---------------------------------------------------------------
  // 4. Database populater (with base* logic)
  // ---------------------------------------------------------------
  for (const { name, version } of toolEntries) {
    const current = await db.toolVersion.findUnique({ where: { name } });

    if (!current) {
      await db.toolVersion.create({
        data: {
          name,
          version,
          added_at: new Date(),
          verified_at: new Date(),
        },
      });
      continue;
    }
    if (verbose) {
      await logj({
        domain: "dashboard",
        level: "info",
        message: `Same Version  --  ${name} ${current.version}`,
        file: "app/dashboard/page.tsx",
        line: 145,
        payload: {
          name: name,
          version: current.version,
          verified: current.verified_at,
        },
        meta: { built: { ...built, eventIndex: ++jei } },
      });
    }

    if (current.version === version) {
      await db.toolVersion.update({
        where: { name },
        data: { verified_at: new Date() },
      });
      continue;
    }

    // Version changed → keep the old one as base*
    const baseName = `base${name}`;

    await logj({
      domain: "dashboard",
      level: "info",
      message: `New Version ${name} →→ ${version}`,
      file: "app/dashboard/page.tsx",
      line: 171,
      payload: {
        name,
        baseName,
        oldVersion: current.version,
        newVersion: version,
        added: current.added_at,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    await db.toolVersion.upsert({
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

    await db.toolVersion.update({
      where: { name },
      data: {
        version,
        added_at: new Date(),
        verified_at: new Date(),
      },
    });
  }

  // ---------------------------------------------------------------
  // 5. Fetch logs
  // ---------------------------------------------------------------
  const logs = await db.log.findMany({
    orderBy: { created_at: "desc" },
    take: 50,
  });

  // ---------------------------------------------------------------
  // 6. Render
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
