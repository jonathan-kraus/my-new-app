import { NextResponse } from "next/server";

const VERCEL_API = "https://api.vercel.com";

export async function GET() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return NextResponse.json(
      { error: "Missing Vercel API credentials" },
      { status: 500 },
    );
  }

  const teamParam = teamId ? `&teamId=${teamId}` : "";

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Fetch usage
  const usageRes = await fetch(
    `${VERCEL_API}/v6/usage?projectId=${projectId}${teamParam}`,
    { headers },
  );
  const usage = await usageRes.json();

  // Fetch deployments
  const deployRes = await fetch(
    `${VERCEL_API}/v13/deployments?projectId=${projectId}${teamParam}&limit=5`,
    { headers },
  );
  const deployments = await deployRes.json();

  // Fetch project config
  const projectRes = await fetch(
    `${VERCEL_API}/v9/projects/${projectId}${teamParam}`,
    { headers },
  );
  const project = await projectRes.json();

  return NextResponse.json({
    usage,
    deployments,
    project,
  });
}
