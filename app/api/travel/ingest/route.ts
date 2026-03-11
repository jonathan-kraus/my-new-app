import { NextResponse } from "next/server";
import { ingestTravelEmails } from "@/lib/travel/ingest/email-ingest";

export async function POST() {
  try {
    const result = await ingestTravelEmails();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("Ingest error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
