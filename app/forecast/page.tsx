import { db } from "@/lib/db";
import ForecastClient from "@/app/forecast/ForecastClient";
import { getCurrentTemp } from "./getCurrentTemp";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const temp = await getCurrentTemp();
  return {
    title: `Forecast — ${temp}°F`,
  };
}

export default async function ForecastPage() {
  const locations = await db.location.findMany({
    orderBy: { name: "asc" },
  });

  return <ForecastClient locations={locations} />;
}
