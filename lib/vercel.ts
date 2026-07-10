/*
 * @FilePath: \my-new-app\lib\vercel.ts
 * @LastEditTime: 2026-07-10 18:20:40
 */
// lib/vercel.ts

export async function vercelRequest<T>(
  path: string,
  params?: Record<string, string | undefined>,
): Promise<T> {
  const url = new URL(`https://api.vercel.com${path}`);

  const teamId = process.env.VERCEL_TEAM_ID;

  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) {
        url.searchParams.set(k, v);
      }
    }
  }

  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error("Missing VERCEL_TOKEN");
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      `Vercel API ${res.status} ${res.statusText}: ${JSON.stringify(json)}`,
    );
  }

  return json as T;
}

export interface VercelDeploymentsResponse {
  deployments: any[];
  pagination: any;
}

export async function getVercelDeployments(
  projectId: string,
): Promise<VercelDeploymentsResponse> {
  return vercelRequest<VercelDeploymentsResponse>("/v6/deployments", {
    projectId,
    limit: "5",
  });
}