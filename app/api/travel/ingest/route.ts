import { withRequestTiming } from "@/lib/log/with-request-timing";
import { NextResponse } from "next/server";
import { ingestTravelEmails } from "@/lib/travel/ingest/email-ingest";

async function POSTHandler() {
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

export const POST = withRequestTiming("POST", "/travel/ingest", POSTHandler);
