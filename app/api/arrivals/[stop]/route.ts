/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-24 15:43:38
 */
import { NextResponse } from "next/server";
import { mbta } from "@/lib/mbta";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function GET(
  request: Request,
  { params }: { params: { stop: string } },
) {
  const stopId = params.stop;

  const built = await buildUniversalContext(request as any, "mbta");
  console.log("built:", built);
  let jei = 0;
  try {
    await logj({
      domain: "arrivals",
      level: "info",
      message: "Arrivals GET started stopid: " + stopId,
      file: "app/api/arrivals/[stop]/route.ts",
      line: 20,
      payload: { stopid: stopId, URL: request.url },
      meta: { built: { ...(built ?? {}), eventIndex: ++jei } },
    });
  } catch (err) {
    console.error("logj: THREW", err);
  }

  // Build MBTA API URL
  const url = new URL("https://api-v3.mbta.com/predictions");
  url.searchParams.set("filter[stop]", stopId);
  url.searchParams.set("include", "trip");
  url.searchParams.set("sort", "arrival_time");

  // Optional: add your API key if needed
  // url.searchParams.set("api_key", process.env.MBTA_API_KEY!);

  const res = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
    },
    next: { revalidate: 0 }, // always fresh
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch MBTA arrivals" },
      { status: res.status },
    );
  }

  const json = await res.json();
  const data = json.data;

  await logj({
    domain: "arrivals",
    level: "info",
    message: "Arrivals GET completed stopid: " + stopId,
    file: "app/api/arrivals/[stop]/route.ts",
    line: 59,
    payload: {
      Arrivals_response: JSON.stringify(data, null, 2),
      URL: request.url,
      data_length: data.length,
      Params: params,
    },
    meta: { built: { ...(built ?? {}), eventIndex: ++jei } },
  });

  // Return raw MBTA data — let the widget parse it
  return NextResponse.json(json);
}
