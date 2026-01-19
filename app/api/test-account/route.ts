// app/api/test-account/route.ts
import { db } from "@/lib/db";

export async function GET() {
  const user = await db.user.create({
    data: { email: `test+${Date.now()}@example.com` },
  });

  const session = await db.session.create({
    data: {
      userId: user.id,
      token: `tok_${Date.now()}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      ipAddress: "127.0.0.1",
      userAgent: "test",
    },
  });

  return Response.json({ user, session });
}
