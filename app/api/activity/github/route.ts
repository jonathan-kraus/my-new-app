import { NextResponse } from "next/server";
import { Axiom } from "@axiomhq/js";
import { logit } from "@/lib/log/server";

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});

export async function GET() {
  try {
    await logit({
      level: "info",
      message: "GitHub activity API hit",
      file: "api/activity/github",
    });

    const query = `
  ['github-events']
  | where repo == "jonathan-kraus/my-new-app"
	| project id=data.id, repo=data.repo, commitSha=data.commitSha, name=data.name
  | limit 10
`;

    await logit({
      level: "info",
      message: "Running Axiom query",
      data: { query },
    });

    const result = await axiom.query(query);
    await logit({
      level: "info",
      message: "Running Axiom query",
      data: { result },
    });
    await logit({
      level: "info",
      message: "Axiom query result",
      data: {
        matchesCount: result?.matches?.length ?? 0,
        hasMatches: !!result?.matches,
      },
    });

    const rows = result?.matches ?? [];

    const activity = rows.map((row: any) => {
      const d = row.data;
      logit({
        level: "info",
        message: "Ran Axiom query multi",
        data: {
          query,
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
        },
      });
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

    await logit({
      level: "info",
      message: "Mapped GitHub activity",
      data: { count: activity.length },
    });

    return NextResponse.json({ ok: true, activity });
  } catch (err: any) {
    await logit({
      level: "error",
      message: "GitHub activity API failed",
      file: "api/activity/github",
      data: { error: err?.message, stack: err?.stack },
    });

    return NextResponse.json(
      { ok: false, error: "Failed to fetch GitHub activity" },
      { status: 500 },
    );
  }
}
