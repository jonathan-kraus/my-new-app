// app/api/weather/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { logj } from "@/lib/log/logj";
import { getWeatherForLocation } from "@/lib/weather/get-weather";

export async function GET(req: NextRequest) {
  const built = await buildUniversalContext(req, "WEATHER");
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "Missing locationId" }, { status: 400 });
  }

  try {
    const result = await getWeatherForLocation(locationId, { logContext: { requestUrl: req.url } });
    return NextResponse.json(result);
  } catch (err) {
    await logj({
      domain: "weather",
      level: "error",
      message: "Weather GET failed",
      file: "app/api/weather/route.ts",
      payload: { error: String((err as Error)?.message ?? err), locationId },
      meta: { built: { ...built } },
    });
    return NextResponse.json({ error: String((err as Error)?.message ?? err) }, { status: 500 });
  }
}
