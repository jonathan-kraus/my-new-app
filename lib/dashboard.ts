export const dynamic = "force-dynamic";

import { getVercelDeployments } from "./vercel";
import { getRecentActivity } from "./github";
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";


export interface VercelDeploymentsResponse {
  deployments: any[];
  pagination: any;
}

export interface DashboardData {
  vercel: VercelDeploymentsResponse | null;
  github: any[] | null;
  astronomy: any | null;
  system: { generatedAt: string };
}
const built = staticUniversalContext("Dashboard");
let jei = 0;
export async function logDashboardAstronomy(snapshot: unknown) {
  await logj({
    domain: "DashboardAstronomy",
    level: "info",
    message: "Dashboard Astronomy snapshot",
    file: "dashboard.ts",
    line: 24,
    payload: { some: "data", snapshot },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const [vercelResult, githubResult, astronomyResult] = await Promise.all([
    safe<VercelDeploymentsResponse>(() => getVercelDeployments()),
    safe(() => getRecentActivity("jonathan-kraus")),
    safe(() => getEphemerisSnapshot("KOP")),
  ]);

  const vercel = vercelResult.ok ? vercelResult.data : null;

  await logj({
    domain: "vercel",
    level: "info",
    message: "Dashboard Vercel deployments initial call",
    file: "dashboard.ts",
    line: 46,
    payload: {
      vercelResultOk: vercelResult.ok,
      vercelRaw: vercel,
      vercelError: vercelResult.ok ? null : String(vercelResult.error),
      vercelCount: Array.isArray(vercel?.deployments)
        ? vercel.deployments.length
        : "not-array",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  console.log("dashboard vercelResult.ok", vercelResult.ok);
  console.log("dashboard vercel raw", JSON.stringify(vercel, null, 2));
  console.log(
    "dashboard vercel count",
    Array.isArray(vercel?.deployments)
      ? vercel.deployments.length
      : "not-array",
  );

  const github = githubResult.ok ? githubResult.data : [];
  const astronomy = astronomyResult.ok
    ? (astronomyResult.data.snapshot ?? null)
    : null;

  if (astronomy) {
    await logDashboardAstronomy(astronomy);
  }

  return {
    vercel,
    github,
    astronomy,
    system: {
      generatedAt: new Date().toISOString(),
    },
  };
}

export type SafeResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: unknown };

export async function safe<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return { ok: false, error };
  }
}