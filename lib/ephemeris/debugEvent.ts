import { db } from "@/lib/db";

export async function writeEphemerisDebugEvent(data: any) {
  try {
    await db.ephemerisDebug.create({
      data: {
        locationId: data.locationId ?? null,
        fetchedAt: data.fetchedAt ?? null,
        createdAt: data.createdAt ?? null,
        date: data.date ?? null,

        sunrise: data.sunrise ?? null,
        sunset: data.sunset ?? null,

        moonrise: data.moonrise ?? null,
        moonset: data.moonset ?? null,
        moonPhase: data.moonPhase ?? null,

        sunriseBlueStart: data.sunriseBlueStart ?? null,
        sunriseBlueEnd: data.sunriseBlueEnd ?? null,
        sunriseGoldenStart: data.sunriseGoldenStart ?? null,
        sunriseGoldenEnd: data.sunriseGoldenEnd ?? null,
        sunsetGoldenStart: data.sunsetGoldenStart ?? null,
        sunsetGoldenEnd: data.sunsetGoldenEnd ?? null,
        sunsetBlueStart: data.sunsetBlueStart ?? null,
        sunsetBlueEnd: data.sunsetBlueEnd ?? null,

        raw: data.raw ?? {},
      },
    });
  } catch (err) {
    console.error("Failed to write Ephemeris debug event", err);
  }
}
