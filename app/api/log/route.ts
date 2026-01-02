// app/api/log/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    await prisma.log.create({
      data: {
        level: body.level,
        message: body.message,
        data: body.data ?? null,
        page: body.page ?? null,

        // 🔑 Session enrichment
        userId: session?.user?.id ?? null,
        sessionEmail: session?.user?.email ?? null,
        sessionUser: session?.user?.name ?? null,

        createdAt: new Date(body.createdAt),
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[LOG API ERROR]", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
