import { NextResponse } from "next/server";
import { logit } from "@/lib/log/server";
import { Axiom } from "@axiomhq/js";

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});

export async function GET() {
  try {
    const apl = `
      ['github_events']
      | sort(desc: createdAt)
      | limit(50)
    `;

    const result = await axiom.query(apl);

    // OLD CLIENT: results are in `matches`, not `data`
    const rows = result?.matches ?? [];

    await logit({
      level: "info",
      message: "Fetched GitHub activity",
      data: { count: rows.length },
    });

    return NextResponse.json(rows);
  } catch (err: any) {
    await logit({
      level: "error",
      message: "GitHub activity fetch failed",
      data: { error: err.message },
    });

    return NextResponse.json([], { status: 500 });
  }
}
