/*
 * @FilePath: \my-new-app\app\api\email\weather\route.ts
 * @LastEditTime: 2026-03-11 00:14:47
 */
// app/api/email/weather/route.ts

import { NextResponse } from "next/server";
import { sendWeatherEmail } from "@/lib/server/email/sendWeatherEmail";
import { logit } from "@/lib/log/logit";

export async function POST() {
  const eventIndex = 22;
  const requestId = crypto.randomUUID();
  try {
    const result = await sendWeatherEmail("TW message", "TW subject");

    logit(
      "jonathan",
      {
        level: "info",
        message: "weather_email_api_success mock",
        result,
      },
      { eventIndex },
      {
        requestId: requestId,
        route: "api/email/weather",
        userId: "JK",
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    logit(
      "jonathan",
      {
        level: "error",
        message: "weather_email_api_error",
        error: String(err),
      },
      { eventIndex },
      {
        requestId: requestId,
        route: "api/email/weather",
        userId: "JK",
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );

    return NextResponse.json(
      { ok: false, error: "Failed to send weather email" },
      { status: 500 },
    );
  }
}
