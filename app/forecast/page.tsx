// app/forecast/page.tsx
import { auth } from "@/auth";
import ForecastClient from "./ForecastClient";
import { buildWeatherEmail } from "./buildWeatherEmail";
import { sendWeatherEmail } from "./mailersend";
import { db } from "@/lib/db";

//
// ⭐ SERVER ACTION — must stay in a server component
//
export async function sendForecastEmailAction(formData: FormData) {
  "use server";

  const to = formData.get("email") as string;

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
