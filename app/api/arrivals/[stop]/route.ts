/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts

\[stop]\route.ts
 * @LastEditTime: 2026-08-24 16:48:12
 */
import { NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function GET(
  request: Request,
  { params }: { params: { stop: string } },
) {
  // ⭐ Correctly read stopId from App Router params
  const stopId = params.stop;
  console.log("### USING NEW ARRIVALS ROUTE ### stopId =", stopId);

  const built = await buildUniversalContext(request as any, "mbta");
  let jei = 0;

  try {
    await logj({
      domain: "arrivals",
      level: "info",
      message: `Arrivals GET started stopid: ${stopId}`,
      file: "app/api/arrivals/[stop]/route.ts",
      line: 20,
      payload: {
        stopid: stopId,
        URL: request.url,
      },
      meta: { built: { ...(built ?? {}), eventIndex: ++jei } },
    });
  } catch (err) {
    console.error("logj: THREW", err);
  }

  // ⭐ Build MBTA API URL
  const url = new URL("https://api-v3.mbta.com/predictions");
  url.searchParams.set("filter[stop]", stopId);
  url.searchParams.set("include", "trip");
  url.searchParams.set("sort", "arrival_time");

  const res = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch MBTA arrivals" },
      { status: res.status },
    );
  }

  const json = await res.json();
  const data = json.data ?? [];

  await logj({
    domain: "arrivals",
    level: "info",
    message: `Arrivals GET completed stopid: ${stopId}`,
    file: "app/api/arrivals/[stop]/route.ts",
    line: 59,
    payload: {
      Arrivals_response: JSON.stringify(data, null, 2),
      URL: request.url,
      data_length: data.length,
      stopid: stopId, // ⭐ Log the real stopId
    },
    meta: { built: { ...(built ?? {}), eventIndex: ++jei } },
  });

  return NextResponse.json(json);
}
