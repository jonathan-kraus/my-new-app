// app/api/log/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  await db.log.create({
    data: {
      level: body.level,
      message: body.message,
      data: body.data,
      page: body.page,
      userId: session?.user?.id ?? null,
      createdAt: new Date(body.createdAt),
    },
  });

  return Response.json({ success: true });
}
