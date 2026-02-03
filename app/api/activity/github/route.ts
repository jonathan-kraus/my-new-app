// app/api/activity/github/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Axiom } from "@axiomhq/js";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
export async function GET(req: NextRequest) {
  const H1 = Date.now();

  console.log("DB TEST", H1, req);
  return NextResponse.json({ ok: true, time: H1 });
}
const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});

export async function PUT(req: Request) {
  const ctx = await enrichContext(req as any);

  try {
    await logit(
      "github",
      {
        level: "info",
        message: "GitHub activity API hit",
        payload: { route: "activity" },
      },
      {
        requestId: ctx.requestId,
        route: ctx.page,
        userId: ctx.userId,
      },
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
      {
        requestId: ctx.requestId,
        route: ctx.page,
        userId: ctx.userId,
      },
    );

    const result = await axiom.query(query);

    await logit(
      "github",
      {
        level: "info",
        message: "Axiom query result",

        payload: {
          dataset: result.datasetNames,
          matchCount: result.matches?.length ?? 0,
        },
      },
      {
        requestId: ctx.requestId,
        route: ctx.page,
        userId: ctx.userId,
      },
    );

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

      // Prefer success
      const isSuccess = (x: any) => x.conclusion === "success";

      if (isSuccess(item) && !isSuccess(existing)) {
        bySha.set(sha, item);
        continue;
      }

      // Otherwise prefer newest
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
      {
        requestId: ctx.requestId,
        route: ctx.page,
        userId: ctx.userId,
      },
    );

    return NextResponse.json({ ok: true, activity });
  } catch (err: any) {
    await logit(
      "github",
      {
        level: "error",
        message: "GitHub activity API failed",
        payload: { error: err?.message },
      },
      {
        requestId: ctx.requestId,
        route: ctx.page,
        userId: ctx.userId,
      },
    );

    return NextResponse.json(
      { ok: false, error: "Failed to fetch GitHub activity" },
      { status: 500 },
    );
  }
}
