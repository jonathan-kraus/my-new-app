import { requireRuntimeAdmin, RuntimeAccessError } from "@/lib/runtime/admin";
import { CatalogSyncBusyError, getMbtaSyncState } from "@/lib/mbta/catalog";
import { syncMbtaCatalog } from "@/lib/mbta/sync";

export const runtime = "nodejs";
export const maxDuration = 300;

async function authorize(request: Request, mutation = false) {
  await requireRuntimeAdmin();
  if (
    mutation &&
    request.headers.get("origin") !== new URL(request.url).origin
  ) {
    return Response.json(
      { error: "Refresh requests must originate from this site." },
      { status: 403 },
    );
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const denied = await authorize(request);
    if (denied) return denied;
    return Response.json(
      { state: await getMbtaSyncState() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof RuntimeAccessError)
      return Response.json({ error: error.message }, { status: error.status });
    console.error("MBTA refresh status failed", error);
    return Response.json(
      { error: "Could not load refresh status." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const denied = await authorize(request, true);
    if (denied) return denied;
    return Response.json({ state: await syncMbtaCatalog() });
  } catch (error) {
    if (error instanceof RuntimeAccessError)
      return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof CatalogSyncBusyError)
      return Response.json({ error: error.message }, { status: 409 });
    console.error("MBTA refresh failed", error);
    return Response.json(
      { error: "Refresh failed. The previous catalog is still available." },
      { status: 502 },
    );
  }
}
