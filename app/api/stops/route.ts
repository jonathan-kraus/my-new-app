import { withRequestTiming } from "@/lib/log/with-request-timing";
import { CatalogUnavailableError, getMbtaCatalog } from "@/lib/mbta/catalog";

export const runtime = "nodejs";
async function GETHandler() {
  try {
    const catalog = await getMbtaCatalog();
    return Response.json({ data: catalog.stops, syncedAt: catalog.syncedAt });
  } catch (error) {
    if (!(error instanceof CatalogUnavailableError))
      console.error("MBTA stops read failed", error);
    return Response.json(
      { error: "Stop catalog is temporarily unavailable." },
      { status: 503 },
    );
  }
}

export const GET = withRequestTiming("GET", "/stops", GETHandler);
