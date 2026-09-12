import { db } from "@/lib/db";
import WeatherClient from "./WeatherClient";

export const metadata = {
  title: "Weather",
};

export default async function WeatherPage() {
  const locations = await db.location.findMany({
    orderBy: { name: "asc" },
  });

  return <WeatherClient locations={locations} />;
}
