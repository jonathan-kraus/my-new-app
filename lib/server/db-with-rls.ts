// lib/server/db-with-rls.ts

import { neon } from "@neondatabase/serverless";

export function getDbWithRls(email: string) {
  const sql = neon(process.env.DATABASE_URL!);

  return (strings: TemplateStringsArray, ...values: any[]) => {
    return sql(strings, ...values, {
      fetchOptions: {
        headers: {
          "app.current_user_email": email,
        },
      },
    });
  };
}
