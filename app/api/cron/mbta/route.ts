import { CatalogSyncBusyError } from "@/lib/mbta/catalog";
import { syncMbtaCatalog } from "@/lib/mbta/sync";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return Response.json({ state: await syncMbtaCatalog() });
  } catch (error) {
    if (error instanceof CatalogSyncBusyError)
      return Response.json({ error: error.message }, { status: 409 });
    console.error("Scheduled MBTA refresh failed", error);
    return Response.json({ error: "MBTA refresh failed." }, { status: 502 });
  }
}
