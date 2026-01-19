// app/api/astronomy/route.ts
import { getAstronomySnapshot } from "@/lib/astronomy/getAstronomySnapshot";

export async function GET() {
  const { today, tomorrow } = await getAstronomySnapshot("KOP");
  return Response.json({ today, tomorrow });
}
