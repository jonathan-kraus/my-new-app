// app/dashboard/page.tsx
import { getDashboardData } from "@/lib/dashboard";
//import { AstronomyCard } from "./components/AstronomyCard";
import { VercelCard } from "@/app/components/dashboard/vercel-card";
//import { GitHubCard } from "./components/GitHubCard";
//import { WeatherCard } from "./components/WeatherCard";
//import { LogsCard } from "./components/LogsCard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      {/* <AstronomyCard data={data.astronomy} /> */}
      <VercelCard data={data.vercel} />
      {/* <GitHubCard data={data.github} /> */}
      {/* <WeatherCard data={data.weather} /> */}
      {/* <LogsCard data={data.logs} /> */}
    </div>
  );
}
