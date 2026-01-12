// lib/server/db-with-rls.ts
import { neon } from "@neondatabase/serverless";
import { logit } from "../log/server";

export async function getDbWithRls(email: string) {
  await logit({
    level: "info",
    message: "In getDbWithRls",
    file: "lib/server/db-with-rls.ts",
    page: "Notes app",
    data: { email: email || "Guest" },
  });

  // Create an RLS-enabled SQL client
  const sql = neon(process.env.DATABASE_URL!, {
    fetchOptions: {
      headers: {
        "X-User-Email": email, // your RLS header
      },
    },
  });

  return sql; // ✔️ this has .query()
}
