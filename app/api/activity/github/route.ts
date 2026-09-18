import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db8 } from "@/lib/db.prisma8";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function GET(req: NextRequest) {
  const start = performance.now();
  const built = await buildUniversalContext(req, "GITHUB_ACTIVITY");
  let eventIndex = 0;

  // --- Request Start ---------------------------------------------------------
  await logj({
    domain: "GITHUB_ACTIVITY",
    level: "info",
    message: "GitHub activity request started",
    file: "app/api/activity/github/route.ts",
    line: 13,
    meta: { built: { ...built, eventIndex: ++eventIndex } },
  });

  try {
    // --- Prisma Query Diagnostics -------------------------------------------
    await logj({
      domain: "GITHUB_ACTIVITY",
      level: "debug",
      message: "Querying Prisma for recent GitHub events",
      file: "app/api/activity/github/route.ts",
      line: 24,
      meta: { built: { ...built, eventIndex: ++eventIndex } },
    });

    const events = await db8.orm.public.GithubEvent.orderBy((githubEvent) =>
      githubEvent.updatedAt.desc(),
    )
      .limit(50)
      .all();

    await logj({
      domain: "GITHUB_ACTIVITY",
      level: "info",
      message: `Prisma returned ${events.length} events`,
      file: "app/api/activity/github/route.ts",
      line: 38,
      payload: { count: events.length },
      meta: { built: { ...built, eventIndex: ++eventIndex } },
    });

    // --- Normalization -------------------------------------------------------
    const normalized = events.map((e) => ({
      id: e.id,
      name: e._type,
      repo: e.repo,
      status: e.status,
      conclusion: e.conclusion,
      event: e._type,
      actor: e.actor,
      commitMessage: e.commitMessage,
      commitSha: e.commitSha,
      url: e.url,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      source: "github",
    }));

    await logj({
      domain: "GITHUB_ACTIVITY",
      level: "debug",
      message: "Normalized GitHub events",
      file: "app/api/activity/github/route.ts",
      line: 65,
      payload: { sample: normalized[0] ?? null },
      meta: { built: { ...built, eventIndex: ++eventIndex } },
    });

    // --- Deduplication -------------------------------------------------------
    const bySha = new Map<string, any>();

    for (const item of normalized) {
      const sha = item.commitSha ?? item.id;

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

    await logj({
      domain: "GITHUB_ACTIVITY",
      level: "info",
      message: "Deduplication complete",
      file: "app/api/activity/github/route.ts",
      line: 101,
      payload: {
        before: normalized.length,
        after: activity.length,
      },
      meta: { built: { ...built, eventIndex: ++eventIndex } },
    });

    // --- Request End ---------------------------------------------------------
    const duration = performance.now() - start;

    await logj({
      domain: "GITHUB_ACTIVITY",
      level: "info",
      message: `GitHub activity request completed in ${duration.toFixed(2)}ms`,
      file: "app/api/activity/github/route.ts",
      line: 117,
      meta: { built: { ...built, eventIndex: ++eventIndex } },
    });

    return NextResponse.json({ ok: true, activity });
  } catch (err: unknown) {
    const duration = performance.now() - start;
    const message = err instanceof Error ? err.message : String(err);

    // --- Error Logging -------------------------------------------------------
    await logj({
      domain: "GITHUB_ACTIVITY",
      level: "error",
      message: `GitHub activity failed: ${message}`,
      file: "app/api/activity/github/route.ts",
      line: 132,
      payload: {
        error: message,
        stack: err instanceof Error ? err.stack : null,
      },
      meta: { built: { ...built, eventIndex: ++eventIndex, duration } },
    });

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json({ ok: true, note: "PUT no longer needed" });
}

export async function DELETE() {
  return NextResponse.json({ ok: true, note: "DELETE no longer needed" });
}
