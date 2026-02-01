// app/api/debug/timestamps/route.ts
import { buildAstronomySnapshot } from "@/lib/buildAstronomySnapshot";
export async function GET() {
  try {
    const snapshot = await buildAstronomySnapshot(
      {
        id: "KOP",
        latitude: 40.101,
        longitude: -75.383,
        timezone: "America/New_York",
      },
      new Date(),
    );

    return Response.json({ snapshot, error: null });
  } catch (err: any) {
    return Response.json({
      snapshot: null,
      error: err?.message ?? "Unknown error",
    });
  }
}
