/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-22 19:05:27
 */
import { mbta } from "@/lib/mbta";
console.log("api/arrivals/[stop]/route.ts loaded");
export async function GET(
  req: Request,
  { params }: { params: { stop: string } },
) {
  const data = await mbta("predictions", { "filter[stop]": params.stop });
  return Response.json(data);
}
