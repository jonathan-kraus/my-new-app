import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET — return recent GitHub events from the database
export async function GET(req: NextRequest) {
  try {
    const events = await prisma.githubEvent.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
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

    return NextResponse.json({ ok: true, activity });
  } catch (err: any) {
    console.error("GitHub activity DB error:", err);
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
