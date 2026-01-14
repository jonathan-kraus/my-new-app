// lib/server/db-with-rls.ts

import { neon } from "@neondatabase/serverless";

export function getDbWithRls(email: string) {
  // Create client WITHOUT connection string
  const client = neon();

  // Return a tagged-template wrapper that injects RLS headers
  return (strings: TemplateStringsArray, ...values: any[]) => {
    return client(
      process.env.DATABASE_URL!,
      {
        fetchOptions: {
          headers: {
            "app.current_user_email": email,
          },
        },
      },
      strings,
      ...values
    );
  };
}
