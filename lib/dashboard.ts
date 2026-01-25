// lib/dashboard.ts
export const dynamic = "force-dynamic";
import { getVercelDeployments } from "./vercel";
import { getRecentActivity } from "./github";
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";

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

  const [vercel, github, astronomy] = await Promise.all([
    safe<VercelDeploymentsResponse>(() => getVercelDeployments(projectId)),
    safe(() => getRecentActivity("jonathan-kraus")),
    safe(() => getEphemerisSnapshot("KOP")),
  ]);

  return {
    vercel,
    github,
    astronomy,
    system: {
      generatedAt: new Date().toISOString(),
    },
  };
}

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    return null;
  }
}
