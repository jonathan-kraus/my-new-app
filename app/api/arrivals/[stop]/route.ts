/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-23 22:49:34
 */
import { mbta } from "@/lib/mbta";
import { logj } from "@/lib/log/client";
import { staticUniversalContext } from "@/lib/log/buildj";
import { Axiom } from "@axiomhq/js";

export async function GET(req: Request, context: any) {
  const ctx = await context;
  const params = await ctx.params;
  const built = staticUniversalContext("mbta");
  console.log("built:", built);
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
  await new Promise((r) => setTimeout(r, 10));
  console.log("*api/arrivals/[stop]/route.ts loaded");
  console.log("*URL:", req.url);
  console.log("*Params:", params);
  await new Promise((r) => setTimeout(r, 10));
  console.log("*Fetching MBTA data");
  const data = await mbta("predictions", {
    "filter[stop]": params.stop,
    include: "trip",
  });
  console.log("Arrivals response:", JSON.stringify(data, null, 2));

  return Response.json(data);
}
