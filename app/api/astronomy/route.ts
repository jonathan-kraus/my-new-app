// app/api/test-astronomy/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const latitude = 40.0893;     // KOP example
  const longitude = -75.3836;
  const timezone = "America/New_York";

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set("timezone", timezone);
  url.searchParams.set(
    "daily",
    "sunrise,sunset,moonrise,moonset,moon_phase"
  );
  url.searchParams.set("forecast_days", "7");

  console.log("Fetching:", url.toString());

  const res = await fetch(url.toString());

  if (!res.ok) {
    return NextResponse.json({
      ok: false,
      status: res.status,
      statusText: res.statusText,
      url: url.toString(),
    });
  }

  const json = await res.json();

  return NextResponse.json({
    ok: true,
    url: url.toString(),
    data: json,
  });
}
