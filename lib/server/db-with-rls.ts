// lib/server/db-with-rls.ts
import { createClient } from "@neondatabase/serverless";

export function getDbWithRls(email: string) {
  const client = createClient({
    fetchOptions: {
      headers: {
        "app.current_user_email": email,
      },
    },
  });

  return client(process.env.DATABASE_URL!);
}
