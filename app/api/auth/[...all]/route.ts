import { getAuth } from "@/lib/auth";
export const runtime = "nodejs";

export async function GET(req: Request) {
	const auth = await getAuth();
	try {
		const res = await auth.handler(req);
		// Log response headers to inspect Set-Cookie and cookie attributes
		// eslint-disable-next-line no-console
		console.error("Auth handler response headers:", Object.fromEntries(res.headers.entries()));
		return res;
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
	const auth = await getAuth();
	try {
		const res = await auth.handler(req);
		// Log response headers to inspect Set-Cookie and cookie attributes
		// eslint-disable-next-line no-console
		console.error("Auth handler response headers:", Object.fromEntries(res.headers.entries()));
		return res;
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
