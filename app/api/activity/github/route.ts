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

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/events?per_page=20`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch GitHub events" },
      { status: res.status }
    );
  }

  const events = await res.json();

  const mapped = events.map((e: any) => {
    const type = e.type;

    // Normalize timestamps
    const created_at =
      e.created_at ||
      e.payload?.pull_request?.created_at ||
      e.payload?.workflow_run?.created_at ||
      null;

    // Normalize message / description
    let message = "";
    if (type === "PushEvent") {
      message = e.payload.commits?.[0]?.message || "Push";
    } else if (type === "PullRequestEvent") {
      message = `${e.payload.action} PR #${e.payload.number}`;
    } else if (type === "WorkflowRunEvent") {
      message = `Workflow: ${e.payload.workflow_run.name}`;
    } else if (type === "CreateEvent") {
      message = `Created ${e.payload.ref_type}: ${e.payload.ref}`;
    } else {
      message = type;
    }

    return {
      id: e.id,
      type,
      actor: e.actor?.login,
      avatar: e.actor?.avatar_url,
      message,
      created_at,
      url:
        e.payload?.pull_request?.html_url ||
        e.payload?.workflow_run?.html_url ||
        null,
      status:
        e.payload?.workflow_run?.conclusion ||
        e.payload?.pull_request?.state ||
        null,
    };
  });

  return NextResponse.json(mapped);
}
