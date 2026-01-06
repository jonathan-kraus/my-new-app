import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { logit } from "@/lib/log/server";
export async function GET() {
  const to = "jonathan.c.kraus@gmail.com";
  await sendTestEmail(to);
  await logit({
    level: "info",
    message: "Email test sent",
    file: "app/api/email/test/route.ts",
    line: 6,
    sessionUser: "Jonathan",
  });
  return new Response(`Test email sent to ${to}`);
}
