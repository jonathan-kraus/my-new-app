/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-23 22:18:22
 */
import { mbta } from "@/lib/mbta";
import { logj } from "@/lib/log/client";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function GET(req: Request, context: any) {
  const ctx = await context;
  const params = await ctx.params;
  const built = await buildUniversalContext(req as any, "mbta");
  let jei = 0;
  await logj({
    domain: "arrivals",
    level: "info",
    message: "🎶 Arrivals GET started 🎶",
    file: "app/api/arrivals/[stop]/route.ts",
    line: 11,
    payload: {
      some: "data",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  console.log("*api/arrivals/[stop]/route.ts loaded");
  console.log("*URL:", req.url);
  console.log("*Params:", params);

  console.log("*Fetching MBTA data");
  const data = await mbta("predictions", {
    "filter[stop]": params.stop,
    include: "trip",
  });
  console.log("Arrivals response:", JSON.stringify(data, null, 2));

  return Response.json(data);
}
