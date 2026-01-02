// app/api/debug-auth-headers/route.ts

import {
	getLastAuthResponseHeaders,
	clearLastAuthResponseHeaders,
	getLastAuthRequestHeaders,
	clearLastAuthRequestHeaders,
} from "@/lib/auth-debug";

export async function GET() {
	const responseHeaders = getLastAuthResponseHeaders();
	const requestHeaders = getLastAuthRequestHeaders();
	// Clear after read to avoid leaking between requests
	clearLastAuthResponseHeaders();
	clearLastAuthRequestHeaders();
	return new Response(JSON.stringify({ requestHeaders, responseHeaders }), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}
