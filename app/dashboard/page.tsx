// app/dashboard/page.tsx
import { getDashboardData } from "@/lib/dashboard";
import { AstronomyCard } from "@/app/astronomy/AstronomyCard";
import { VercelCard } from "@/app/components/dashboard/vercel-card";
import VersionCard from "@/app/components/dashboard/version-card";
import { useVersionSWR } from "@/hooks/useVersionSWR";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import type { Metadata } from "next";
import { auth } from "@/auth";
import BuildCard from "../components/dashboard/build-card";
import { db } from "@/lib/db";

//import { GitHubCard } from "./components/GitHubCard";
//import { WeatherCard } from "./components/WeatherCard";
//import { LogsCard } from "./components/LogsCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard " };
let jei = 0;

export default async function DashboardPage(req: Request) {
  const built = await buildUniversalContext(req as any, "DASHBOARD");

  let session = await auth();

  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page loaded",
    file: "app/dashboard/page.tsx",
    line: 19,
    payload: { title: metadata.title, a: "b", user: session?.user },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const data = await getDashboardData();

  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page data fetched",
    file: "app/dashboard/page.tsx",
    line: 39,
    payload: { data: data },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const tools = data.build.tools;
  console.log("TOOLS:", tools);
  await logj({
    domain: "dashboard",
    level: "info",
    message: "Tools information @# ",
    file: "app/dashboard/page.tsx",
    line: 50,
    payload: { TOOLS: tools },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const toolEntries = Object.entries(tools).map(([name, version]) => ({
    name,
    version,
  }));

  for (const { name, version } of toolEntries) {
    const existing = await db.toolVersion.findUnique({ where: { name } });

    if (!existing) {
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

    if (existing.version === version) {
      await db.toolVersion.update({
        where: { name },
        data: { verified_at: new Date() },
      });
    } else {
      await db.toolVersion.update({
        where: { name },
        data: {
          version,
          added_at: new Date(),
          verified_at: new Date(),
        },
      });
    }
  }
const all = useVersionSWR("all");
  return (
    
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      <AstronomyCard data={data.astronomy} />
     <VercelCard data={all.data} />
      {/* <GitHubCard data={data.github} /> */}
      {/* <WeatherCard data={data.weather} /> */}
      {/* <LogsCard data={data.logs} /> */}
      <VersionCard />
      <BuildCard build={data.build} />
    </div>
  );
}
