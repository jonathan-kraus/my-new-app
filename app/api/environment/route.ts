/*
 * @FilePath: \my-new-app\app\api\environment\route.ts
 * @LastEditTime: 2026-06-18 09:29:58
 */
// app/api/environment/route.ts
import { NextResponse } from "next/server";

const vercelToken = process.env.VERCEL_API_TOKEN!;
const vercelProjectId = process.env.VERCEL_PROJECT_ID!;
const neonApiKey = process.env.NEON_API_KEY!;
const neonProjectId = process.env.NEON_PROJECT_ID!;
const githubRepo = process.env.GITHUB_REPO!; // "owner/repo"

export async function GET() {
  try {
    // --- 1. VERCEL PROJECT ---
    const vercelProject = await fetch(
      `https://api.vercel.com/v9/projects/${vercelProjectId}`,
      { headers: { Authorization: `Bearer ${vercelToken}` } },
    ).then((r) => r.json());

    // --- 2. VERCEL LATEST DEPLOYMENT ---
    const vercelDeployments = await fetch(
      `https://api.vercel.com/v13/deployments?projectId=${vercelProjectId}&limit=1`,
      { headers: { Authorization: `Bearer ${vercelToken}` } },
    ).then((r) => r.json());

    const latestDeployment = vercelDeployments.deployments?.[0] ?? null;

    // --- 3. NEON COMPUTE ENDPOINTS ---
    const neonEndpoints = await fetch(
      `https://console.neon.tech/api/v2/projects/${neonProjectId}/endpoints`,
      { headers: { Authorization: `Bearer ${neonApiKey}` } },
    ).then((r) => r.json());

    const primaryEndpoint = neonEndpoints.endpoints?.find(
      (e: any) => e.type === "primary",
    );

    // --- 4. NEON PROJECT INFO ---
    const neonProject = await fetch(
      `https://console.neon.tech/api/v2/projects/${neonProjectId}`,
      { headers: { Authorization: `Bearer ${neonApiKey}` } },
    ).then((r) => r.json());

    // --- 5. GITHUB LATEST COMMIT ---
    const githubCommit = await fetch(
      `https://api.github.com/repos/${githubRepo}/commits/main`,
      { headers: { "User-Agent": "env-status" } },
    ).then((r) => r.json());

    // --- 6. GITHUB WORKFLOW STATUS ---
    const githubWorkflows = await fetch(
      `https://api.github.com/repos/${githubRepo}/actions/runs?per_page=1`,
      { headers: { "User-Agent": "env-status" } },
    ).then((r) => r.json());

    const latestWorkflow = githubWorkflows.workflow_runs?.[0] ?? null;

    return NextResponse.json({
      vercel: {
        project: vercelProject,
        latestDeployment,
      },
      neon: {
        primaryEndpoint,
        project: neonProject,
      },
      github: {
        latestCommit: githubCommit,
        latestWorkflow,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, stack: err.stack },
      { status: 500 },
    );
  }
}
