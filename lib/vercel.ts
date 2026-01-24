// lib\vercel.ts
import type { VercelUsage, VercelDeployment, VercelProject } from "@/types/vercel";

export async function getVercelData() {
  const res = await fetch("/api/vercel", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch Vercel data");

  const json = await res.json();

  return {
    usage: json.usage as VercelUsage,
    deployments: json.deployments.deployments as VercelDeployment[],
    project: json.project as VercelProject,
  };
}
