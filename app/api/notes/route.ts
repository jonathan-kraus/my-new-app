import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
	const auth = await getAuth();
	let session;
	try {
		session = await auth.api.getSession({ headers: req.headers });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error("Failed while getting session:", err);
		// eslint-disable-next-line no-console
		console.error("ENV: DATABASE_URL set?", !!process.env.DATABASE_URL);
		throw err;
	}

	if (!session?.user) {
		// log session and incoming headers to help debug missing session
		// eslint-disable-next-line no-console
		console.error("Missing session user. Session:", session);
		// eslint-disable-next-line no-console
		console.error("Request headers:", Object.fromEntries(req.headers.entries()));
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const notes = await db.note.findMany({
		where: { userEmail: session.user.email },
		orderBy: { createdAt: "desc" },
	});

	return Response.json(notes);
}
