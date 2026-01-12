import { NextResponse } from "next/server";
import { Axiom } from "@axiomhq/js";
import { logit } from "@/lib/log/server";

export async function GET() {
  const axiom = new Axiom({
    token: process.env.AXIOM_TOKEN!,
  });

  try {
    const result = await axiom.query(`
      ['github-events']
      | sort(desc: "updatedAt")
      | limit(10)
    `);

    const rows = result?.matches ?? [];

const activity = rows
.map((row) => row.data)
.filter((d) => d)  // remove null/undefined rows
 .map((d) => ({
  id: d.id ?? null,
  name: d.name ?? "Unknown",
  status: d.status ?? "unknown",
  conclusion: d.conclusion ?? null,
  repo: d.repo ?? null,
  createdAt: d.createdAt ?? null,
  updatedAt: d.updatedAt ?? null, }));

await logit({
  level: "info",
  message: "GitHub Axiom rows",
  data: { sample: rows[0] },
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
