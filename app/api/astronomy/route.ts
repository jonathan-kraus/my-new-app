// app/api/astronomy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDbWithRls } from "@/lib/server/db-with-rls";
import { logit } from "@/lib/log/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RLS-enabled SQL client
    const dbRls = await getDbWithRls(email);

    // Determine local date
    const now = new Date();
    const localISO = now.toLocaleString("sv-SE", {
      timeZone: "America/New_York",
    });
    const localDate = localISO.slice(0, 10);

    // Tomorrow
    const tomorrowDate = new Date(`${localDate}T00:00:00`);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowISO = tomorrowDate.toISOString().slice(0, 10);

    const searchParams = req.nextUrl.searchParams;
    const locationId = searchParams.get("locationId") ?? "WIL";

    const today = await dbRls.query(
  `
  SELECT *
  FROM "AstronomySnapshot"
  WHERE DATE("date") = $1
    AND "locationId" = $2
  LIMIT 1
  `,
  [localDate, locationId]
);

const tomorrow = await dbRls.query(
  `
  SELECT *
  FROM "AstronomySnapshot"
  WHERE DATE("date") = $1
    AND "locationId" = $2
  LIMIT 1
  `,
  [tomorrowISO, locationId]
);

// ✔️ Neon returns arrays, not { rows }
const todayRow = today[0] ?? null;
const tomorrowRow = tomorrow[0] ?? null;


    if (!todayRow) {
      return NextResponse.json(
        { error: "No astronomy data for today" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      today: todayRow,
      tomorrow: tomorrowRow,
    });
  } catch (err: any) {
    await logit({
      level: "error",
      message: "Astronomy API failed",
      file: "app/api/astronomy/route.ts",
      data: { error: err.message },
    });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
