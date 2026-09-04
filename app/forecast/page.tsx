/*
 * @FilePath: \my-new-app\app\forecast\page.tsx
 * @LastEditTime: 2026-09-04 00:27:19
 */
// app/forecast/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { buildWeatherEmail } from "./buildWeatherEmail";
import { sendWeatherEmail } from "./mailersend";
import { db } from "@/lib/db";

const ForecastClient = dynamic(() => import("./ForecastClient"), {
  ssr: false,
});
//
// ⭐ SERVER ACTION — must stay in a server component
//
export async function generateMetadata() {
  const temperature = await db.weatherSnapshot.findFirst({
    select: { temperature: true },
    where: { locationId: "KOP" },
    orderBy: { fetchedAt: "desc" },
  });

  const temp = Math.round(temperature?.temperature ?? 0);

  return { title: `Forecast - ${temp}°F` };
}

export async function sendForecastEmailAction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session) redirect("/signin");
  const to = session?.user?.email;

  if (!to) {
    throw new Error(
      "No email found in session. Please log in to use this feature.",
    );
  }

  const weatherEmail = buildWeatherEmail({
    locationName: formData.get("locationName") as string,
    current: {
      temperature: Number(formData.get("temperature")),
      feelsLike: Number(formData.get("feelsLike")),
      humidity: Number(formData.get("humidity")),
      windSpeed: Number(formData.get("windSpeed") || formData.get("windspeed")),
      fetchedAt: formData.get("fetchedAt") as string,
    },
    astronomy: {
      sunrise: formData.get("sunrise") as string,
      sunset: formData.get("sunset") as string,
      moonrise: formData.get("moonrise") as string,
      moonset: formData.get("moonset") as string,
      moonPhaseName: formData.get("moonPhaseName") as string,
      moonPhaseEmoji: formData.get("moonPhaseEmoji") as string,
    },
    source: formData.get("source") as string,
  });

  await sendWeatherEmail({ to, weatherEmail });
}

//
// ⭐ PAGE COMPONENT — pure server component
//
export default async function ForecastPage() {
  const session = await auth();

  // Prisma is safe here because this file is server-only
  const locations = await db.location.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <ForecastClient
      locations={locations}
      sendForecastEmailAction={sendForecastEmailAction}
    />
  );
}
