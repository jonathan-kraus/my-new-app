/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-23 16:10:38
 */
import { mbta } from "@/lib/mbta";

export async function GET(req: Request, context: any) {
  const ctx = await context;
  const params = await ctx.params;

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
