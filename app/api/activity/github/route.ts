import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return NextResponse.json(
      { error: "Missing GitHub environment variables" },
      { status: 500 }
    );
  }

  // Fetch last 5 deployments
  const deploymentsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/deployments?per_page=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    }
  );

  if (!deploymentsRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch deployments" },
      { status: deploymentsRes.status }
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
    })
  );

  return NextResponse.json(enriched);
}
