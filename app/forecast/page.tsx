import { db } from "@/lib/db";
import ForecastClient from "@/app/forecast/ForecastClient";

export const dynamic = "force-dynamic";

export default async function ForecastPage() {
  const locations = await db.location.findMany({
    orderBy: { name: "asc" },
  });

  return <ForecastClient locations={locations} />;
}
