/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-22 19:41:26
 */
import { mbta } from "@/lib/mbta";

export async function GET(req: Request, context: { params: { stop: string } }) {
  const params = context.params;
  console.log("api/arrivals/[stop]/route.ts loaded");
  console.log("URL:", req.url);
  console.log("Params:", params);
  const data = await mbta("predictions", { "filter[stop]": params.stop });
  return Response.json(data);
}
