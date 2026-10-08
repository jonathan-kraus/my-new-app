import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { CatalogSyncBusyError } from "@/lib/mbta/catalog";
import { syncMbtaCatalog } from "@/lib/mbta/sync";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const built = staticUniversalContext("side-nav");
  let jei = 0;
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (secret) {
    logj({
      domain: "MBTA",
      level: "info",
      message: `🚇 Cron job triggered`,
      file: "app/api/cron/mbta/route.ts",
      line: 14,
      payload: {
        method: built.method,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
  }
  if (!secret || authorization !== `Bearer ${secret}`) {
    const suppliedSecret = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;
    const suffix = (value: string | null | undefined) =>
      !value ? null : value.length <= 5 ? "[too short]" : value.slice(-5);
    logj({
      domain: "MBTA",
      level: "warn",
      message: `Cron authorization rejected`,
      file: "app/api/cron/mbta/route.ts",
      line: 32,
      payload: {
        secretConfigured: Boolean(secret),
        authorizationPresent: Boolean(authorization),
        bearerFormatValid: Boolean(authorization?.startsWith("Bearer ")),
        configuredSecretSuffix: suffix(secret),
        suppliedSecretSuffix: suffix(suppliedSecret),
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
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
