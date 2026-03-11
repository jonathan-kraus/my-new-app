/*
 * @FilePath: \my-new-app\app\api\fa\dashboard\route.ts
 * @LastEditTime: 2026-03-10 17:53:44
 */
// app/api/fa/dashboard/route.ts
import { getConfig } from "@/lib/runtime/config";
import { NextResponse } from "next/server";
import { toZonedTime, format } from "date-fns-tz";
import { logit } from "@/lib/log/logit";

type Flight = {
  scheduled_out?: string | null;
};

export async function GET() {
  await logit("jonathan", {
        level: "info",
        message: "Loading FA dashboard route",
        time: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      }, { eventIndex }, {
          requestId: crypto.randomUUID(), route: "app/api/fa/dashboard/route.ts", userId: "JK",
          requestId: ctx?.requestId ?? req?.id,
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        });

  // 1. Fetch flight count
  const minLat = await getConfig("minLat", "40.0893");
  const minLon = await getConfig("minLon", "-105.7435");
  const maxLat = await getConfig("maxLat", "40.7142");
  const maxLon = await getConfig("maxLon", "-104.9679");

  const query = `-latlong "${minLat} ${minLon} ${maxLat} ${maxLon}"`;

  const countRes = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/search/count?query=${encodeURIComponent(
      query,
    )}`,
    {
      headers: { "x-apikey": process.env.FLIGHTAWARE_API_KEY! },
    },
  );

  const countData = await countRes.json();
  await logit("jonathan", {
      level: "info",
      message: "Completed FA dashboard route",
      requestId: crypto.randomUUID(),
      countData: countData,
      minLat: minLat,
      minLon: minLon,
      maxLat: maxLat,
      maxLon: maxLon,
      route: "app/api/fa/dashboard/route.ts",
      userId: "JK",
    }, { eventIndex }, {
        requestId: ctx?.requestId ?? req?.id,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      });
  // 2. Fetch AA877 status
  const ident = await getConfig("flight-ID", "flight-ID");
  const statusRes = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/${ident}`,
    {
      headers: { "x-apikey": process.env.FLIGHTAWARE_API_KEY! },
    },
  );

  const statusData = await statusRes.json();

  // 3. Filter to today's flight

  const eastern = "America/New_York";

  const today = format(toZonedTime(new Date(), eastern), "yyyy-MM-dd");

  const current = statusData.flights.find((f: Flight) => {
    const sched = f.scheduled_out?.slice(0, 10);
    return sched === today;
  });

  return NextResponse.json({
    count: countData.count,
    flight: current ?? null,
  });
}
