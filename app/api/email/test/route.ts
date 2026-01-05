import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
export async function GET() {
  const to = "jonathan.c.kraus@gmail.com";
  await sendTestEmail(to);
  return new Response(`Test email sent to ${to}`);
}
