/*
 * @FilePath: \my-new-app\lib\travel\ingest\route.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-22 13:11:05
 * @Description  :
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-11 01:23:43
 */
import { NextResponse } from "next/server";
import { ingestTravelEmails } from "@/lib/travel/ingest/email-ingest";
import { logit } from "@/lib/log/logit";

export const dynamic = "force-dynamic";
const eventIndex = 22;
const requestId = crypto.randomUUID();
export async function POST(req: Request) {
  await logit(
    "jonathan",
    {
      level: "info",
      message: "travel-ingest-start",
      url: req.url,
      someatent: "somevalue",
    },
    { eventIndex },
    {
      notused: "notused",
      requestId: requestId,
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
  const result = await ingestTravelEmails();

  await logit(
    "jonathan",
    {
      level: "info",
      message: "travel-ingest-end",
      result: result,
      someatent: "somevalue",
    },
    { eventIndex },
    {
      notused: "notused",
      requestId: requestId,
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
  return NextResponse.json({ ok: true, result });
}
