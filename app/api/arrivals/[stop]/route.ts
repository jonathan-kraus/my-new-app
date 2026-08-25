/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-25 18:23:48
 */
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function GET(request: Request) {
  // Extract stop ID from the URL path
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const stopId = parts[parts.length - 1];

  const requestUrl = `https://api-v3.mbta.com/predictions?filter[stop]=${stopId}&include=route`;
  const built = await buildUniversalContext(request as any, "mbta");
  let jei = 0;

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
  await logj({
    domain: "arrivals",
    level: "info",
    message: `Arrivals GET completed for stopId: ${stopId}`,
    file: "app/api/arrivals/[stop]/route.ts",
    line: 54,
    payload: {
      stopId: stopId,
      requestUrl: requestUrl,
      count: predictions?.data?.length ?? 0,
      raw: predictions,
    },
    meta: { built: { ...(built ?? {}), eventIndex: ++jei } },
  });
  return Response.json(predictions);
}
