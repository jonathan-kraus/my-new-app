import { neon } from "@neondatabase/serverless";

export function getDbWithRls(email: string) {
  return neon(process.env.DATABASE_URL!, {
    fetchOptions: {
      headers: {
        "app.current_user_email": email,
      },
    },
  });
}
