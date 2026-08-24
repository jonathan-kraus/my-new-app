/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-24 00:06:54
 */
import { mbta } from "@/lib/mbta";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function GET(req: Request, context: any) {
  const ctx = await context;
  const params = await ctx.params;
  const built = await buildUniversalContext(req as any, "mbta");
  console.log("built:", built);
  let jei = 0;
  try {
    await logj({
      domain: "arrivals",
      level: "info",
      message: "Arrivals GET started",
      file: "app/api/arrivals/[stop]/route.ts",
      line: 16,
      payload: { some: "data" },
      meta: { built: { ...(built ?? {}), eventIndex: ++jei } },
    });
  } catch (err) {
    console.error("logj: THREW", err);
  }

  const data = await mbta("predictions", {
    "filter[stop]": params.stop,
    include: "trip",
  });

  await logj({
    domain: "arrivals",
    level: "info",
    message: "Arrivals GET completed",
    file: "app/api/arrivals/[stop]/route.ts",
    line: 34,
    payload: {
      Arrivals_response: JSON.stringify(data, null, 2),
      URL: req.url,
      Params: params,
    },
    meta: { built: { ...(built ?? {}), eventIndex: ++jei } },
  });

  return Response.json(data);
}
