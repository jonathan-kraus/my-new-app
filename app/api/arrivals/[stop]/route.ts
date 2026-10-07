/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-09-13 20:26:21
 */
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { getStopName } from "@/lib/mbta/stops";

export async function GET(request: Request) {
  // Extract stop ID from the URL path
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const stopId = parts[2] ?? ""; // always a string

  const built = await buildUniversalContext(request, "mbta");
  let jei = 0;
  const requestUrl = new URL("https://api-v3.mbta.com/predictions");

  requestUrl.searchParams.set("filter[stop]", stopId);
  requestUrl.searchParams.set("include", "trip,route");
  requestUrl.searchParams.set("fields[trip]", "headsign,destination");
  requestUrl.searchParams.set("sort", "arrival_time");
  const res = await fetch(requestUrl, {
    headers: process.env.MBTA_KEY ? { "x-api-key": process.env.MBTA_KEY } : {},
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok)
    return Response.json(
      { error: "Live arrivals are temporarily unavailable." },
      { status: 502 },
    );
  const predictions: {
    data?: Array<{
      attributes?: { direction_id?: number };
      relationships?: { route?: { data?: { id?: string } } };
    }>;
  } = await res.json();

  console.info(
    "[MBTA DEBUG]",
    JSON.stringify(
      {
        stopId,
        requestUrl,
        timestamp: new Date().toISOString(),
        responseSummary: {
          hasData:
            Array.isArray(predictions?.data) && predictions.data.length > 0,
          count: predictions?.data?.length ?? 0,
          directions: [
            ...new Set(
              predictions?.data?.map((p) => p?.attributes?.direction_id),
            ),
          ],
          routes: [
            ...new Set(
              predictions?.data?.map((p) => p?.relationships?.route?.data?.id),
            ),
          ],
        },
        raw: predictions,
      },
      null,
      2,
    ),
  );
  const JStop = await getStopName(stopId).catch(() => stopId);
  await logj({
    domain: "arrivals",
    level: "info",
    message: `Arrivals GET started for stopId: ${JStop}`,
    file: "app/api/arrivals/[stop]/route.ts",
    line: 60,
    payload: {
      stopId: stopId,
      computedstop: JStop,
      requestUrl: requestUrl,
      count: predictions?.data?.length ?? 0,
      raw: predictions,
    },
    meta: { built: { ...(built ?? {}), eventIndex: ++jei } },
  });

  return Response.json(predictions);
}
