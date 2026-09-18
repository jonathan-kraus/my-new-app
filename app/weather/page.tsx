import { db8 } from "@/lib/db.prisma8";
import WeatherClient from "./WeatherClient";

export const metadata = {
  title: "Weather",
};

export default async function WeatherPage() {
  const locations = await db8.orm.public.Location.all();
  console.log({ locations });
  return <WeatherClient locations={locations} />;
}
