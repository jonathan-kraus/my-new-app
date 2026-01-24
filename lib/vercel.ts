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
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
    },
    cache: "no-store",
  });

  const json = await res.json();

  console.log(`[VERCEL RAW] ${path}`, JSON.stringify(json, null, 2));

  return json as T;
}
export async function getFormattedVercelUsage() {
  const raw = await getVercelUsage();
  const formatted = normalizeUsage(raw);

  console.log("[VERCEL FORMATTED]", formatted);

  return formatted;
}
export function normalizeUsage(raw: any) {
  if (!raw || raw.error) {
    return {
      ok: false,
      error: raw?.error?.message ?? "Unknown Vercel API error",
      usage: null,
    };
  }

  return {
    ok: true,
    usage: {
      bandwidth: raw.bandwidth?.total ?? 0,
      serverlessInvocations: raw.serverless?.invocations ?? 0,
      edgeInvocations: raw.edge?.invocations ?? 0,
      buildMinutes: raw.build?.minutes ?? 0,
      periodStart: raw.period?.start ?? null,
      periodEnd: raw.period?.end ?? null,
    },
  };
}
export async function getVercelDeployments(projectId: string) {
  return vercelRequest("/v6/deployments", { projectId });
}
export async function getVercelUsage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return vercelRequest("/v1/usage", {
    from: startOfMonth.toISOString(),
    to: now.toISOString()
  });
}

export async function getVercelProject(projectName: string) {
  return vercelRequest(`/v9/projects/${projectName}`);
}
