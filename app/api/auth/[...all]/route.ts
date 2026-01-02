import { getAuth } from "@/lib/auth";
import { setLastAuthResponseHeaders, setLastAuthRequestHeaders } from "@/lib/auth-debug";
export const runtime = "nodejs";

export async function GET(req: Request) {
	// Entry log to confirm handler invocation and incoming request details
	// eslint-disable-next-line no-console
	console.error("Auth handler invoked (GET)", {
		url: req.url,
		method: req.method,
		headers: Object.fromEntries(req.headers.entries()),
	});
	const auth = await getAuth();
	try {
		// capture incoming request headers for debugging
		const reqHeaders = Object.fromEntries(req.headers.entries());
		setLastAuthRequestHeaders(reqHeaders as Record<string, string>);
		// eslint-disable-next-line no-console
		console.error("Auth handler request headers:", reqHeaders);

		const res = await auth.handler(req);
		// Log response headers to inspect Set-Cookie and cookie attributes
		// eslint-disable-next-line no-console
		const headers = Object.fromEntries(res.headers.entries());
		// store for debug endpoint
		setLastAuthResponseHeaders(headers as Record<string, string>);
		// eslint-disable-next-line no-console
		console.error("Auth handler response headers:", headers);
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
	// Entry log to confirm handler invocation and incoming request details
	// eslint-disable-next-line no-console
	console.error("Auth handler invoked (POST)", {
		url: req.url,
		method: req.method,
		headers: Object.fromEntries(req.headers.entries()),
	});
	const auth = await getAuth();
	try {
		// capture incoming request headers for debugging (POST)
		const reqHeaders = Object.fromEntries(req.headers.entries());
		setLastAuthRequestHeaders(reqHeaders as Record<string, string>);
		// eslint-disable-next-line no-console
		console.error("Auth handler request headers:", reqHeaders);

		const res = await auth.handler(req);
		// Log response headers to inspect Set-Cookie and cookie attributes
		// eslint-disable-next-line no-console
		const headers = Object.fromEntries(res.headers.entries());
		// store for debug endpoint
		setLastAuthResponseHeaders(headers as Record<string, string>);
		// eslint-disable-next-line no-console
		console.error("Auth handler response headers:", headers);
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
