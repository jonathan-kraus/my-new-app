/*
 * @FilePath: \my-new-app\app\api\db-tables\send-db-email\route.ts
 * @LastEditTime: 2026-09-19 14:19:38
 */
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { Temporal } from "temporal-polyfill";
import { getTopTables } from "@/lib/getTopTables";
import TopTablesEmail from "@/emails/TopTablesEmail";
import { db8 } from "@/lib/db.prisma8";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function POST(req: Request) {
  const { to, firstName } = await req.json();
  const built = await buildUniversalContext(req, "DB-TABLES");
  let jei = 0;
  const middleInit = "C";
  const resend = new Resend(process.env.RESEND_API_KEY);
  const top = await getTopTables();
  const latestWeatherSnapshot = await db8.orm.public.WeatherSnapshot.where({
    locationId: "KOP",
  })
    .orderBy((snapshot) => snapshot.fetchedAt.desc())
    .select(
      "temperature",
      "feelsLike",
      "humidity",
      "windSpeed",
      "windDirection",
      "pressure",
      "visibility",
      "weatherCode",
      "fetchedAt",
    )
    .first();
  await logj({
    domain: "Tables",
    level: "info",
    message: ` Top tables data retrieved with ${top.length} tables`,
    file: "app/api/db-tables/send-db-email/route.ts",
    line: 37,
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
          fetchedAt: Temporal.PlainDateTime.from(
            latestWeatherSnapshot.fetchedAt,
          )
            .toZonedDateTime("UTC")
            .toInstant()
            .toString({ smallestUnit: "millisecond" }),
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

  await resend.emails.send({
    from: "my-new-app <dbemail@kraus.my.id>",
    to: to,
    subject: "Top 5 Tables",
    react: TopTablesEmail(data),
  });

  return NextResponse.json({ ok: true });
}
