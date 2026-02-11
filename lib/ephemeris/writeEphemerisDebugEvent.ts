/*
 * @FilePath     : \my-new-app\lib\ephemeris\writeEphemerisDebugEvent.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-11 13:00:15
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-11 13:00:15
 */
import { db } from "@/lib/db";

type DebugEventInput = {
  locationId: string | null;
  fetchedAt: string | null;
  createdAt: string | null;
  date: string | null;

  sunrise: string | null;
  sunset: string | null;

  moonrise: string | null;
  moonset: string | null;
  moonPhase: number | null;

  sunriseBlueStart: string | null;
  sunriseBlueEnd: string | null;
  sunriseGoldenStart: string | null;
  sunriseGoldenEnd: string | null;
  sunsetGoldenStart: string | null;
  sunsetGoldenEnd: string | null;
  sunsetBlueStart: string | null;
  sunsetBlueEnd: string | null;

  raw: any;
};

export async function writeEphemerisDebugEvent(data: DebugEventInput) {
  try {
    await db.ephemerisDebug.create({
      data: {
        locationId: data.locationId,
        fetchedAt: data.fetchedAt,
        createdAt: data.createdAt,
        date: data.date,

        sunrise: data.sunrise,
        sunset: data.sunset,

        moonrise: data.moonrise,
        moonset: data.moonset,
        moonPhase: data.moonPhase ?? null,

        sunriseBlueStart: data.sunriseBlueStart,
        sunriseBlueEnd: data.sunriseBlueEnd,
        sunriseGoldenStart: data.sunriseGoldenStart,
        sunriseGoldenEnd: data.sunriseGoldenEnd,
        sunsetGoldenStart: data.sunsetGoldenStart,
        sunsetGoldenEnd: data.sunsetGoldenEnd,
        sunsetBlueStart: data.sunsetBlueStart,
        sunsetBlueEnd: data.sunsetBlueEnd,

        raw: data.raw,
      },
    });
  } catch (err) {
    console.error("Failed to write Ephemeris debug event:", err);
  }
}
