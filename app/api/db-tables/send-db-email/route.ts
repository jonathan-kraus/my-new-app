/*
 * @FilePath: \my-new-app\app\api\db-tables\send-db-email\route.ts
 * @LastEditTime: 2026-09-09 16:06:42
 */
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getTopTables } from "@/lib/getTopTables";
import TopTablesEmail from "@/emails/TopTablesEmail";
import { db } from "@/lib/db";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function POST(req: Request) {
  const { to, firstName } = await req.json();
  const built = await buildUniversalContext(req as any, "DB-TABLES");
  let jei = 0;
const middleInit = "C"
  const resend = new Resend(process.env.RESEND_API_KEY);
  const top = await getTopTables();
  const latestWeatherSnapshot = await db.weatherSnapshot.findFirst({
    where: { locationId: "KOP" },
    orderBy: { fetchedAt: "desc" },
    select: {
      temperature: true,
      feelsLike: true,
      humidity: true,
      windSpeed: true,
      windDirection: true,
      pressure: true,
      visibility: true,
      weatherCode: true,
      fetchedAt: true,
    },
  });
  await logj({
    domain: "Tables",
    level: "info",
    message: ` Top tables data retrieved with ${top.length} tables`,
    file: "app/api/db-tables/send-db-email/route.ts",
    line: 34,
    payload: {
      to: to,
      firstname: firstName,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const data = {
    first_name: firstName,
middle_init: middleInit,
    weatherSnapshot: latestWeatherSnapshot
      ? {
          ...latestWeatherSnapshot,
          fetchedAt: latestWeatherSnapshot.fetchedAt.toISOString(),
        }
      : null,
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
