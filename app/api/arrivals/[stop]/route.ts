/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-25 15:40:47
 */
import { NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function GET(request: Request) {
  // Extract stop ID from the URL path
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const stopId = parts[parts.length - 1];

  const requestUrl = `https://api-v3.mbta.com/predictions?filter[stop]=${stopId}&include=route`;

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

  return Response.json(predictions);
}
