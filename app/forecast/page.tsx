// app/forecast/page.tsx
import { auth } from "@/auth";
import { buildWeatherEmail } from "./buildWeatherEmail";
import { sendWeatherEmail } from "./mailersend";
import { db } from "@/lib/db";
import ForecastClient from "./ForecastClient";

//
// ⭐ SERVER ACTION — sends the weather email
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
      windSpeed: Number(formData.get("windSpeed")),
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
// ⭐ PAGE COMPONENT — server wrapper
//
export default async function ForecastPage() {
  const session = await auth();

  // Load locations from Prisma
  const locations = await db.location.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 px-4 py-10 text-white">
      <div className="max-w-6xl mx-auto">
        {/* ⭐ Your existing client-side forecast UI */}
        <ForecastClient locations={locations} />

        {/* ⭐ Email Forecast Form */}
        <form
          action={sendForecastEmailAction}
          className="mt-10 bg-white text-black p-6 rounded-xl shadow space-y-4"
        >
          <h2 className="text-xl font-semibold">Email This Forecast</h2>

          <input
            type="email"
            name="email"
            required
            defaultValue={session?.user?.email ?? ""}
            placeholder="Enter your email"
            className="border px-3 py-2 rounded w-64"
          />

          {/* ⭐ Hidden fields populated by ForecastClient */}
          <div id="forecast-hidden-fields" />

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            📧 Email Me This Forecast
          </button>
        </form>
      </div>
    </div>
  );
}
