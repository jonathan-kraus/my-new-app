import { NextResponse } from "next/server";

const owner = "jonathan-kraus";
const repo = "my-new-app";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  const deploymentsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/deployments?per_page=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    },
  );

  if (!deploymentsRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch deployments" },
      { status: 500 },
    );
  }

  const deployments = await deploymentsRes.json();

  // Fetch statuses for each deployment
  const enriched = await Promise.all(
    deployments.map(async (d: any) => {
      const statusRes = await fetch(d.statuses_url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      });

      const statuses = await statusRes.json();
      const latest = statuses[0];

      return {
        id: d.id,
        sha: d.sha,
        ref: d.ref,
        environment: d.environment,
        created_at: d.created_at,
        creator: d.creator?.login,
        status: latest?.state ?? "unknown",
        log_url: latest?.log_url ?? null,
      };
    }),
  );

  return NextResponse.json(enriched);
}
