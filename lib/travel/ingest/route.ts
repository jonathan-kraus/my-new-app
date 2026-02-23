/*
 * @FilePath: \my-new-app\lib\travel\ingest\route.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-22 13:11:05
 * @Description  :
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-02-23 12:41:32
 */
import { NextResponse } from "next/server";
import { ingestTravelEmails } from "@/lib/travel/ingest/email-ingest";
import { logit } from "@/lib/log/logit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await logit(
    "jonathan",
    {
      level: "info",
      message: "travel-ingest-start",

      payload: {
        url: req.url,

        someatent: "somevalue",
      },
    },
    { notused: "notused" },
  );
  const result = await ingestTravelEmails();

  await logit(
    "jonathan",
    {
      level: "info",
      message: "travel-ingest-end",

      payload: {
        result: result,
        someatent: "somevalue",
      },
    },
    { notused: "notused" },
  );
  return NextResponse.json({ ok: true, result });
}
