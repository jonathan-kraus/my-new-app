// lib/server/db-with-rls.ts
import { db } from "@/lib/db";
import { logit } from "../log/server";

export async function getDbWithRls(email: string) {
     await logit({
      level: "info",
      message: `In getDbWithRls`,
      file: "lib/server/db-with-rls.ts",
      page: "Notes app",
      data: {
        email: email || "Guest",
        line: 6,
      },
    });

  await db.$executeRawUnsafe(
    `SELECT set_config('app.current_user_email', $1, true)`,
    email,
  );

  return db;
}
