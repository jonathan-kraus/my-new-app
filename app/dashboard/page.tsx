// app/dashboard/page.tsx
import { getDashboardData } from "@/lib/dashboard";
import { AstronomyCard } from "@/app/astronomy/AstronomyCard";
import VercelCard from "@/app/components/dashboard/vercel-card";
import VersionCard from "@/app/components/dashboard/version-card";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import type { Metadata } from "next";
import { auth } from "@/auth";

//import { GitHubCard } from "./components/GitHubCard";
//import { WeatherCard } from "./components/WeatherCard";
//import { LogsCard } from "./components/LogsCard";
import { Session } from '../../lib/generated/prisma/browser';
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard" };
let jei = 0;

export default async function DashboardPage(req: Request) {
  const built = await buildUniversalContext(req as any, "DASHBOARD");
  console.log("DashboardPage built context:", built);
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
    line: 32,
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
