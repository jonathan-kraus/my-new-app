/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-22 17:58:46
 */
import { mbta } from "@/lib/mbta";

export async function GET(
  req: Request,
  { params }: { params: { stop: string } },
) {
  const data = await mbta("predictions", { "filter[stop]": params.stop });
  return Response.json(data);
}
