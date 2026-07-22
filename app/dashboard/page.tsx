// app/dashboard/page.tsx
import { getDashboardData } from "@/lib/dashboard";
import { AstronomyCard } from "@/app/astronomy/AstronomyCard";
import VercelCard from "@/app/components/dashboard/vercel-card";
import VersionCard from "@/app/components/dashboard/version-card";
import { logj } from "@/lib/log/client";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import type { Metadata } from "next";

//import { GitHubCard } from "./components/GitHubCard";
//import { WeatherCard } from "./components/WeatherCard";
//import { LogsCard } from "./components/LogsCard";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };
let jei = 0;

export default async function DashboardPage(req: Request) {
  const built = await buildUniversalContext(req as any, "DASHBOARD");
  void logj.info({
    domain: "dashboard",
    message: "Dashboard page loaded",
    file: "DashboardPage.tsx",
    line: 19,
    payload: { title: metadata.title, some: "Dashboard page loaded" },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const data = await getDashboardData();

  await logj({
    domain: "jonathan",
    level: "info",
    message: "Fetched DB overview and history",
    file: "app/admin/db/page.tsx",
    line: 31,
    payload: { data: data },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      <AstronomyCard data={data.astronomy} />
      <VercelCard deployments={data.vercel?.deployments ?? []} />
      {/* <GitHubCard data={data.github} /> */}
      {/* <WeatherCard data={data.weather} /> */}
      {/* <LogsCard data={data.logs} /> */}
      <VersionCard />
    </div>
  );
}
