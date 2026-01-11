import { NextResponse } from "next/server";
import { Axiom } from "@axiomhq/js";
import { logit } from "@/lib/log/server";

export async function GET() {
  const axiom = new Axiom({
    token: process.env.AXIOM_TOKEN!,
  });

  try {
    const result = await axiom.query(`
      ['github_events']
      | sort(desc: "updatedAt")
      | limit(10)
    `);

    const rows = result?.matches ?? [];

    const activity = rows.map((row) => {
      const d = row.data;

      return {
        id: d.id,
        name: d.name,
        status: d.status,
        conclusion: d.conclusion,
        repo: d.repo,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    });

    return NextResponse.json({ ok: true, activity });
  } catch (err) {
    await logit({
      level: "error",
      message: "GitHub activity fetch failed",
      data: {
        error: err instanceof Error ? err.message : String(err),
      },
    });

    return NextResponse.json(
      { ok: false, error: "Failed to fetch GitHub activity" },
      { status: 500 }
    );
  }
}
