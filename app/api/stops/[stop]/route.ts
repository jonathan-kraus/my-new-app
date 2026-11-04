import { withRequestTiming } from "@/lib/log/with-request-timing";
import { CatalogUnavailableError, getMbtaStop } from "@/lib/mbta/catalog";

export const runtime = "nodejs";
async function GETHandler(
  _request: Request,
  { params }: { params: Promise<{ stop: string }> },
) {
  try {
    const { stop } = await params;
    const data = await getMbtaStop(stop);
    if (!data)
      return Response.json({ error: "Stop not found" }, { status: 404 });
    return Response.json(
      { data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (!(error instanceof CatalogUnavailableError))
      console.error("MBTA stop read failed", error);
    return Response.json(
      { error: "Stop details are temporarily unavailable." },
      { status: 503 },
    );
  }
}

export const GET = withRequestTiming("GET", "/stops/[stop]", GETHandler);
