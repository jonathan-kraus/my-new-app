// lib/dashboard.ts
export const dynamic = "force-dynamic";
import { getVercelDeployments } from "./vercel";
import { getRecentActivity } from "./github";
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

const built = await buildUniversalContext(req as any, "DASHBOARD");
let jei = 0;
export function logDashboardAstronomy(snapshot: unknown) {
  await logj({
    domain: "DashboardAstronomy",
    level: "info",
    message: "Dashboard Astronomy snapshot",
    file: "dashboard.ts",
    line: 12,
    payload: { some: "data", snapshot },

    meta: {
      built,
    },
  });

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
    await logj({
      domain: "vercel",
      level: "info",
      message: "Dashboard Vercel deployments initial call",
      file: "dashboard.ts",
      line: 55,
      payload: {
        "dashboard vercelResult.ok": vercelResult.ok,
        "dashboard vercel raw": JSON.stringify(vercel, null, 2),
        "dashboard vercel count": Array.isArray(vercel?.deployments)
          ? vercel.deployments.length
          : "not-array",
      },
      meta: {
        built,
      },
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
    { ok: true; data: T } | { ok: false; error: unknown };

  export async function safe<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
    try {
      const data = await fn();
      return { ok: true, data };
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      return { ok: false, error };
    }
  }
}
