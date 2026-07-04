import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

// GET — return recent GitHub events from the database
export async function GET(req: NextRequest) {
  try {
    const events = await db.githubEvent.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    const built = await buildUniversalContext(req as any, "GITHUB_ACTIVITY");
    let jei = 0;
    await logj({
      domain: "jonathan",
      level: "info",
      message: `** GitHub activity findmany **`,
      file: "app\api\activity\github\route.ts",
      line: 15,
      payload: {
        some: "data",
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    // Normalize to the shape your UI expects
    const normalized = events.map((e) => ({
      id: e.id,
      name: e.type, // your UI uses "name" for workflow name / event type
      repo: e.repo,
      status: e.status,
      conclusion: e.conclusion,
      event: e.type,
      actor: e.actor,
      commitMessage: e.commitMessage,
      commitSha: e.commitSha,
      url: e.url,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      source: "github",
    }));

    // Deduplicate by commitSha (same logic you already had)
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
      domain: "jonathan",
      level: "info",
      message: `** GitHub activity normalized and deduplicated **`,
      file: "app\api\activity\github\route.ts",
      line: 70,
      payload: {
        some: "data",
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return NextResponse.json({ ok: true, activity });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch GitHub activity" },
      { status: 500 },
    );
  }
}

// PUT — optional: keep as a no-op or remove entirely
export async function PUT() {
  return NextResponse.json({ ok: true, note: "PUT no longer needed" });
}

// DELETE — optional: keep as a no-op or remove entirely
export async function DELETE() {
  return NextResponse.json({ ok: true, note: "DELETE no longer needed" });
}
