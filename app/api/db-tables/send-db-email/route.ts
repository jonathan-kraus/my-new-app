/*
 * @FilePath: \my-new-app\app\api\db-tables\send-db-email\route.ts
 * @LastEditTime: 2026-09-07 22:57:43
 */
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getTopTables } from "@/lib/getTopTables";
import TopTablesEmail from "@/emails/TopTablesEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { to, firstName } = await req.json();

  const top = await getTopTables();

  const data = {
    first_name: firstName,
    db1: top[0]?.name ?? "N/A",
    ct1: top[0]?.count ?? 0,
    db2: top[1]?.name ?? "N/A",
    ct2: top[1]?.count ?? 0,
    db3: top[2]?.name ?? "N/A",
    ct3: top[2]?.count ?? 0,
    db4: top[3]?.name ?? "N/A",
    ct4: top[3]?.count ?? 0,
    db5: top[4]?.name ?? "N/A",
    ct5: top[4]?.count ?? 0,
  };
  const tojk = "jonathankraus2026@outlook.com";
  await resend.emails.send({
    from: "my-new-app <dbemail@kraus.my.id>",
    to: tojk,
    subject: "Top 5 Tables",
    react: TopTablesEmail(data),
  });

  return NextResponse.json({ ok: true });
}
