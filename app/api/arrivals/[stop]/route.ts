/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-26 15:09:57
 */
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { getStopName } from "@/lib/mbta/stops";

export async function GET(request: Request) {
  // Extract stop ID from the URL path
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const stopId = parts[2] ?? ""; // always a string

  const built = await buildUniversalContext(request as any, "mbta");
  let jei = 0;
  const requestUrl = new URL("https://api-v3.mbta.com/predictions");

  requestUrl.searchParams.set("filter[stop]", stopId);
  requestUrl.searchParams.set("include", "trip,route");
  requestUrl.searchParams.set("fields[trip]", "headsign,destination");
  requestUrl.searchParams.set("sort", "arrival_time");
  const res = await fetch(requestUrl);
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
  const JStop = getStopName(stopId);
  await logj({
    domain: "arrivals",
    level: "info",
    message: `Arrivals GET started for stopId: ${JStop}`,
    file: "app/api/arrivals/[stop]/route.ts",
    line: 60,
    payload: {
      stopId: stopId,
      computedstop: getStopName(stopId),
      requestUrl: requestUrl,
      count: predictions?.data?.length ?? 0,
      raw: predictions,
    },
    meta: { built: { ...(built ?? {}), eventIndex: ++jei } },
  });

  return Response.json(predictions);
}
