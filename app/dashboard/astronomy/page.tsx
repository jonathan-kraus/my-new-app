// app\dashboard\astronomy\page.tsx
import { getAstronomyDashboard } from "@/lib/astronomy/dashboard";
import { DashboardAstronomyClient } from "@/app/dashboard/astronomy/DashboardAstronomyClient";
export default async function DashboardAstronomyPage() {
  const data = await getAstronomyDashboard();

  if (!data) {
    return <div>No astronomy data available.</div>;
  }

  const { today, tomorrow } = data;

  return <DashboardAstronomyClient today={today} tomorrow={tomorrow} />;
}
