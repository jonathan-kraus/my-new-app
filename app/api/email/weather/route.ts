/*
 * @FilePath: \my-new-app\app\api\email\weather\route.ts
 * @LastEditTime: 2026-02-24 18:08:20
 */
// app/api/email/weather/route.ts

import { NextResponse } from "next/server";
import { sendWeatherEmail } from "@/lib/server/email/sendWeatherEmail";
import { logit } from "@/lib/log/logit";

export async function POST() {
  try {
    const result = await sendWeatherEmail();

    logit("jonathan", {
      level: "info",
      message: "weather_email_api_success mock",
      payload: { result },
    });

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    logit("jonathan", {
      level: "error",
      message: "weather_email_api_error",
      payload: { error: String(err) },
    });

    return NextResponse.json(
      { ok: false, error: "Failed to send weather email" },
      { status: 500 },
    );
  }
}
