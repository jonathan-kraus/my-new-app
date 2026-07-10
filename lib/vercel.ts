// lib/vercel.ts

export async function vercelRequest<T>(
  path: string,
  params?: Record<string, string>,
) {
  const url = new URL(`https://api.vercel.com${path}`);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    },
    cache: "no-store",
  });

  const json = await res.json();
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
  });
}
