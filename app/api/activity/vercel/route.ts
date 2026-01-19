import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  const res = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Vercel deployments" },
      { status: 500 },
    );
  }

  const { deployments } = await res.json();

  const mapped = deployments.map((d: any) => ({
    id: d.uid,
    url: d.url,
    state: d.state,
    createdAt: d.created,
    creator: d.meta?.githubCommitAuthorName,
    commitMessage: d.meta?.githubCommitMessage,
    commitSha: d.meta?.githubCommitSha,
  }));

  return NextResponse.json(mapped);
}
