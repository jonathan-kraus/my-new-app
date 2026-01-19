import { DashboardClientPage } from "./DashboardClientPage";
import { getAstronomySnapshots } from "@/lib/astronomy/getAstronomySnapshots";

export default async function DashboardPage() {
  const data = await getAstronomySnapshots();

  return <DashboardClientPage data={data} />;
}
