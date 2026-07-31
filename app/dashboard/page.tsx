// app/dashboard/page.tsx
import { getDashboardData } from "@/lib/dashboard";
import { getFullPackageData } from "@/lib/version/get-full-package-data";
import { AstronomyCard } from "@/app/astronomy/AstronomyCard";
import { VercelCard } from "@/app/components/dashboard/vercel-card";
import VersionCard from "@/app/components/dashboard/version-card";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import type { Metadata } from "next";
import { auth } from "@/auth";
import BuildCard from "../components/dashboard/build-card";
import { db } from "@/lib/db";

//import { GitHubCard } from "./components/GitHubCard";
//import { WeatherCard } from "./components/WeatherCard";
//import { LogsCard } from "./components/LogsCard";
import { version } from "../../lib/log/context";

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

  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page data fetched",
    file: "app/dashboard/page.tsx",
    line: 40,
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
        message: "Same Version  -- update verfied_at",
        file: "app/dashboard/page.tsx",
        line: 109,
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
      message: "New Version ${name} ",
      file: "app/dashboard/page.tsx",
      line: 134,
      payload: {
        baseName: baseName,
        version: current.version,
        added: current.added_at,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    await db.toolVersion.upsert({
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
  // 5. Render
  // ---------------------------------------------------------------
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      <AstronomyCard data={data.astronomy} />

      {/* Small curated tools still available if you want them */}
      <BuildCard build={{ ...data.build, tools: importantTools }} />

      {/* VercelCard now receives the COMPLETE data */}
      <VercelCard data={fullPackageData} /> 

      <VersionCard />
    </div>
  );
}
