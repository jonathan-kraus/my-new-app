// app/api/activity/github/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Axiom } from "@axiomhq/js";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";

// GET handler — simple health check
export async function GET(req: NextRequest) {
  const now = Date.now();
  console.log("GitHub Activity GET", now);
  return NextResponse.json({ ok: true, time: now });
}

// PUT handler — fetch GitHub activity from Axiom
export async function PUT(req: NextRequest) {
  const ctx = await enrichContext(req as any);

  // Validate token early
  const token = process.env.AXIOM_TOKEN;
  if (!token) {
    await logit(
      "github",
      {
        level: "error",
        message: "Missing Axiom token",
        payload: {},
      },
      { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId }
    );

    return NextResponse.json(
      { ok: false, error: "Axiom token missing" },
      { status: 500 }
    );
  }

  // Create client *inside* the handler (safe)
  const axiom = new Axiom({ token });

  try {
    await logit(
      "github",
      {
        level: "info",
        message: "GitHub activity API hit",
        payload: { route: "activity" },
      },
      { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId }
    );

    const query = `
['github-events']
| where repo == "jonathan-kraus/my-new-app"
| sort by _time desc
| limit 40
`;

    await logit(
      "github",
      {
        level: "info",
        message: "Running Axiom query",
        payload: { query },
      },
      { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId }
    );

    // Run the query
    const result = await axiom.query(query);

    const rows = result?.matches ?? [];

    // Normalize rows
    const normalized = rows.map((row: any) => {
      const d = row.data;
      return {
        id: d.id,
        name: d.name,
        repo: d.repo,
        status: d.status,
        conclusion: d.conclusion,
        event: d.event,
        actor: d.actor,
        commitMessage: d.commitMessage,
        commitSha: d.commitSha,
        url: d.url,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        source: d.source,
      };
    });

    // Deduplicate by commitSha
    const bySha = new Map<string, any>();
    for (const item of normalized) {
      const sha = item.commitSha ?? "unknown";

      if (!bySha.has(sha)) {
        bySha.set(sha, item);
        continue;
      }

      const existing = bySha.get(sha);

      const isSuccess = (x: any) => x.conclusion === "success";

      if (isSuccess(item) && !isSuccess(existing)) {
        bySha.set(sha, item);
        continue;
      }

      if (new Date(item.updatedAt) > new Date(existing.updatedAt)) {
        bySha.set(sha, item);
      }
    }

    const activity = Array.from(bySha.values());

    await logit(
      "github",
      {
        level: "info",
        message: "Mapped GitHub activity",
        payload: { count: activity.length },
      },
      { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId }
    );

    return NextResponse.json({ ok: true, activity });
  } catch (err: any) {
    await logit(
      "github",
      {
        level: "error",
        message: "GitHub activity API failed",
        payload: { error: err?.message ?? "Unknown error" },
      },
      { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId }
    );

    return NextResponse.json(
      { ok: false, error: "Failed to fetch GitHub activity" },
      { status: 500 }
    );
  }
}
