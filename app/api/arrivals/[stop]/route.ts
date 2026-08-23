/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-23 19:05:03
 */
import { mbta } from "@/lib/mbta";
import { logj } from "@/lib/log/client";
import { staticUniversalContext } from "@/lib/log/buildj";

const built = await staticUniversalContext("arrivals");
let jei = 0;

export async function GET(req: Request, context: any) {
  const ctx = await context;
  const params = await ctx.params;
  logj({
    domain: "arrivals",
    level: "info",
    message: "Arrivals GET started",
    file: "app/api/arrivals/[stop]/route.ts",
    line: 16,
    payload: {
      URL: req.url,
      params: params,
      method: req.method,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const data = await mbta("predictions", {
    "filter[stop]": params.stop,
    include: "trip",
  });

  return Response.json(data);
}
