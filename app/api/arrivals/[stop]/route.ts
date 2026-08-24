/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-23 23:26:07
 */
import { mbta } from "@/lib/mbta";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";

export async function GET(req: Request, context: any) {
  const ctx = await context;
  const params = await ctx.params;
  const built = staticUniversalContext("mbta");
  console.log("built:", built);
  let jei = 0;
  try {
    console.log("logj: about to call");
    await logj({
      domain: "arrivals",
      level: "info",
      message: "Arrivals GET started", // plain ASCII for the test
      file: "app/api/arrivals/[stop]/route.ts",
      line: 11,
      payload: { some: "data" },
      meta: { built: { ...(built ?? {}), eventIndex: ++jei } },
    });
    console.log("logj: returned OK");
  } catch (err) {
    console.error("logj: THREW", err);
  }
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
