import { NextResponse } from "next/server";
import { logit } from "@/lib/log/server";

export async function GET() {
  await logit({
    level: "info",
    message: "GitHub Activity Route Loaded",
    file: "app/api/activity/github/route.ts",
    line: 1,
    page: "GitHub Activity",
    data: {},
  });

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  await logit({
    level: "info",
    message: "Environment Variables Loaded",
    file: "app/api/activity/github/route.ts",
    line: 15,
    page: "GitHub Activity",
    data: {
      hasToken: !!token,
      owner,
      repo,
    },
  });

  if (!token || !owner || !repo) {
    await logit({
      level: "error",
      message: "Missing GitHub environment variables",
      file: "app/api/activity/github/route.ts",
      line: 30,
      page: "GitHub Activity",
      data: { token, owner, repo },
    });

    return NextResponse.json(
      { error: "Missing GitHub environment variables" },
      { status: 500 },
    );
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/events?per_page=20`;

  await logit({
    level: "info",
    message: "Fetching GitHub Events",
    file: "app/api/activity/github/route.ts",
    line: 45,
    page: "GitHub Activity",
    data: { url },
  });

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  await logit({
    level: "info",
    message: "GitHub Response Received",
    file: "app/api/activity/github/route.ts",
    line: 60,
    page: "GitHub Activity",
    data: {
      ok: res.ok,
      status: res.status,
    },
  });

  if (!res.ok) {
    const body = await res.text();

    await logit({
      level: "error",
      message: "GitHub API Error",
      file: "app/api/activity/github/route.ts",
      line: 75,
      page: "GitHub Activity",
      data: {
        status: res.status,
        body,
      },
    });

    return NextResponse.json(
      { error: "Failed to fetch GitHub events", status: res.status, body },
      { status: 500 },
    );
  }

  const events = await res.json();

  await logit({
    level: "info",
    message: "GitHub Events Parsed",
    file: "app/api/activity/github/route.ts",
    line: 95,
    page: "GitHub Activity",
    data: {
      count: events.length,
      sampleType: events[0]?.type,
    },
  });

  const mapped = events.map((e: any) => {
    const type = e.type;

    let ref = "";
    let url = "";
    let state = "info";
    const created_at = e.created_at;

    // Pushes
    if (type === "PushEvent") {
      ref = e.payload.ref?.replace("refs/heads/", "") || "push";
      url = `https://github.com/${owner}/${repo}/commit/${e.payload.head}`;
      state = "success";
    }

    // Pull Requests
    if (type === "PullRequestEvent") {
      ref = `PR #${e.payload.number}`;
      url = e.payload.pull_request.html_url;
      state = e.payload.pull_request.merged
        ? "success"
        : e.payload.action === "closed"
          ? "failure"
          : "info";
    }

    // Workflow Runs
    if (type === "WorkflowRunEvent") {
      ref = e.payload.workflow_run.name;
      url = e.payload.workflow_run.html_url;
      state = e.payload.workflow_run.conclusion || "info";
    }

    return {
      id: e.id,
      type,
      ref,
      url,
      state,
      created_at,
    };
  });

  await logit({
    level: "info",
    message: "GitHub Events Mapped",
    file: "app/api/activity/github/route.ts",
    line: 140,
    page: "GitHub Activity",
    data: {
      count: mapped.length,
    },
  });

  return NextResponse.json(mapped);
}
