// lib/server/db-with-rls.ts
import { db } from "@/lib/db";

export async function getDbWithRls(email: string) {
  await db.$executeRawUnsafe(
    `SELECT set_config('app.current_user_email', $1, true)`,
    email,
  );

  return db;
}
