// lib/dashboard.ts
export const dynamic = "force-dynamic";
import { getVercelDeployments } from "./vercel";
import { getRecentActivity } from "./github";
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
// lib/log/dashboardLog.ts
import { logit } from "@/lib/log/logit";

export function logDashboardAstronomy(snapshot: unknown) {
  logit("dashboard", {
    level: "info",
    message: "Dashboard astronomy snapshot",
    data: snapshot,
  });
}

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

export async function getDashboardData(): Promise<DashboardData> {
  const projectId = process.env.VERCEL_PROJECT_ID!;

  const [vercelResult, githubResult, astronomyResult] = await Promise.all([
    safe<VercelDeploymentsResponse>(() => getVercelDeployments(projectId)),
    safe(() => getRecentActivity("jonathan-kraus")),
    safe(() => getEphemerisSnapshot("KOP")),
  ]);

  const vercel = vercelResult.ok ? vercelResult.data : null;
  const github = githubResult.ok ? githubResult.data : [];
  const astronomy = astronomyResult.ok
    ? (astronomyResult.data.snapshot ?? null)
    : null;
  if (astronomy) {
    logDashboardAstronomy(astronomy);
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
