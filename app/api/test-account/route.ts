// app/api/test-account/route.ts
import { db } from "@/lib/db";

export async function GET() {
	const user = await db.user.create({
		data: { email: "test@example.com" },
	});

	const account = await db.account.create({
		data: {
			userId: user.id,
			provider: "github",
			providerAccountId: "123",
		},
	});

	return Response.json({ user, account });
}
