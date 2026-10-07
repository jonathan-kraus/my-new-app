import { CatalogUnavailableError, getMbtaCatalog } from "@/lib/mbta/catalog";

export const runtime = "nodejs";
export async function GET() {
  try {
    return Response.json(await getMbtaCatalog(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (!(error instanceof CatalogUnavailableError))
      console.error("MBTA catalog read failed", error);
    return Response.json(
      {
        error: "The MBTA stop catalog is unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }
}
