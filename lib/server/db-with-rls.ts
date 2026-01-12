// lib/server/db-with-rls.ts
import { neon } from "@neondatabase/serverless";
import { logit } from "../log/server";

export async function getDbWithRls(email: string) {
  await logit({
    level: "info",
    message: "In getDbWithRls",
    file: "lib/server/db-with-rls.ts",
    page: "Notes app",
    data: { email },
  });

  const sql = neon(process.env.DATABASE_URL!, {
    fetchOptions: {
      headers: {
        // ONLY this header is allowed
        "X-User-Email": email,
      },
    },
  });

  return sql;
}
