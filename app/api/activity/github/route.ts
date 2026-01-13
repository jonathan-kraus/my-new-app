import { NextResponse } from "next/server";
import { Axiom } from "@axiomhq/js";

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});

export async function GET() {
  try {
    const result = await axiom.query(`
['github-events']
| where data.repo == "jonathan-kraus/my-new-app"
| sort(desc: "data.updatedAt")
| limit(10)

    `);

    const rows = result?.matches ?? [];

    const activity = rows.map((row: any) => {
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

    return NextResponse.json({ ok: true, activity });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch GitHub activity" },
      { status: 500 }
    );
  }
}
