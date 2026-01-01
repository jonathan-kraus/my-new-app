import { getAuth } from "@/lib/auth";
export const runtime = "nodejs";

export async function GET(req: Request) {
	const auth = getAuth();
	try {
		return await auth.handler(req);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error("Auth handler failed:", err);
		// eslint-disable-next-line no-console
		console.error("ENV: DATABASE_URL set?", !!process.env.DATABASE_URL);
		// eslint-disable-next-line no-console
		console.error("ENV: GITHUB_CLIENT_ID set?", !!process.env.GITHUB_CLIENT_ID);
		// eslint-disable-next-line no-console
		console.error("ENV: GITHUB_CLIENT_SECRET set?", !!process.env.GITHUB_CLIENT_SECRET);
		throw err;
	}
}

export async function POST(req: Request) {
	const auth = getAuth();
	try {
		return await auth.handler(req);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error("Auth handler failed:", err);
		// eslint-disable-next-line no-console
		console.error("ENV: DATABASE_URL set?", !!process.env.DATABASE_URL);
		// eslint-disable-next-line no-console
		console.error("ENV: GITHUB_CLIENT_ID set?", !!process.env.GITHUB_CLIENT_ID);
		// eslint-disable-next-line no-console
		console.error("ENV: GITHUB_CLIENT_SECRET set?", !!process.env.GITHUB_CLIENT_SECRET);
		throw err;
	}
}
