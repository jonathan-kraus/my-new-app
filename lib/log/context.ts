import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { markRequestStart } from "@/lib/log/timing";
import versionInfo from "@/version.json";

export const version = versionInfo.version;

let eventCounter = 0;

export async function enrichContext(req: NextRequest) {
  const requestId =
    req.headers.get("x-request-id") ?? crypto.randomUUID();

  // Start timing for this request
  markRequestStart(requestId);

  // Basic request metadata
  const route = req.nextUrl.pathname ?? undefined;
  const method = req.method;
  const url = req.url;

  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    undefined;

  const userAgent = req.headers.get("user-agent") ?? undefined;

  // Increment per-request event index
  const eventIndex = eventCounter++;

  // Session info
  let sessionEmail: string | undefined = undefined;
  let userId: string | undefined = undefined;

  try {
    const session = await auth();
    sessionEmail = session?.user?.email ?? undefined;
    userId = session?.user?.id ?? undefined;
  } catch {}

  // Timestamps
  const zulu = new Date().toISOString();
  const local = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  // Deployment metadata
  const deploymentId =
    process.env.VERCEL_DEPLOYMENT_ID ?? "local-dev";

  const buildTimestamp =
    process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ?? "unknown";

  const gitCommit =
    process.env.NEXT_PUBLIC_GIT_COMMIT ?? "unknown";

  const gitBranch =
    process.env.NEXT_PUBLIC_GIT_BRANCH ?? "unknown";

  // Runtime metadata
  const runtime = {
    node: process.version,
    region: process.env.VERCEL_REGION ?? "local",
  };

  return {
    requestId,
    eventIndex,
    route,
      page: route,
    method,
    url,
    ip,
    userAgent,
    sessionEmail,
    userId,
    version: versionInfo.version,
    zulu,
    local,
    deploymentId,
    buildTimestamp,
    gitCommit,
    gitBranch,
    runtime,
  };
}
