// app/api/log/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
export async function POST(req: Request) {
	const body = await req.json();

	const session = await auth.api.getSession({
		headers: req.headers,
	});

	//const requestId = req.headers.get("x-request-id");

	await db.log.create({
		data: {
			level: body.level,
			message: body.message,
			data: body.data ?? null,
			page: body.page ?? null,

			// 🔑 identity
			userId: session?.user?.id ?? null,
			sessionEmail: session?.user?.email ?? null,
			sessionUser: session?.user?.name ?? null,

			// 🧭 observability
			//requestId,
			//file: body.file ?? null,
			//line: body.line ?? null,

			createdAt: new Date(body.createdAt),
		},
	});

	return Response.json({ success: true });
}
