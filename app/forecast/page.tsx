/*
 * @FilePath: \my-new-app\app\forecast\page.tsx
 * @LastEditTime: 2026-10-31 22:10:36
 */
// app/forecast/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ForecastWrapper from "./ForecastWrapper";
import { buildWeatherEmail } from "./buildWeatherEmail";
import { sendWeatherEmail } from "./mailresend";
import { db8 } from "@/lib/db.prisma8";
import { timestampString } from "@/lib/timestampString";

//
// ⭐ SERVER ACTION — must stay in a server component
//
export async function generateMetadata() {
  const latestWeather = await db8.orm.public.WeatherSnapshot.where((snapshot) =>
    snapshot.locationId.eq("KOP"),
  )
    .orderBy((snapshot) => snapshot.fetchedAt.desc())
    .first();

  const temperatureDecimal =
    latestWeather?.temperature?.toString().split(".")[1] ?? null;
  const N3 = temperatureDecimal ? parseInt(temperatureDecimal, 10) : null;
  const key = "N3";
  const stringValue = String(N3);
  const now = timestampString(new Date().toISOString());
  console.log(`N3 is ${N3}`);
  const temperature = latestWeather?.temperature ?? null;
  const row = await db8.orm.public.RuntimeConfig.upsert({
    create: {
      key,
      value: stringValue,
      updatedAt: now,
    },
    update: {
      value: stringValue,
      updatedAt: now,
    },
    conflictOn: {
      key,
    },
  });
  console.log(`Upserted row: ${JSON.stringify(row)}`); // Log the upserted row for debugging
  return { title: `Forecast - ${temperature}°F` };
}

export async function sendForecastEmailAction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session) redirect("/api/auth/signin");
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
  // Prisma is safe here because this file is server-only
  const locations = await db8.orm.public.Location.orderBy((location) =>
    location.name.asc(),
  ).all();
  return (
    <ForecastWrapper
      locations={locations}
      sendForecastEmailAction={sendForecastEmailAction}
    />
  );
}
