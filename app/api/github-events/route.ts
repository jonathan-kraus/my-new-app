// app/api/github-events/route.ts
import { NextResponse } from "next/server";
import { client } from "@/lib/axiom";

export async function GET() {
  const apl = `
['github-events']
| where repo == "jonathan-kraus/my-new-app"
| sort desc _time
| limit 30
`;

  try {
    const result = await client.query(apl);

    const legacy = result as any;
    const matches = legacy?.result?.matches ?? [];

    const events = matches.map((m: any) => ({
      ...m.data,
      updatedAt: m.data.updatedAt,
    }));

    return NextResponse.json({ ok: true, events });
  } catch (err) {
    console.error("AXIOM QUERY ERROR", err);
    return NextResponse.json({ ok: false, events: [] });
  }
}
