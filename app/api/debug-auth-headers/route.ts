import { getLastAuthHeaders, clearLastAuthHeaders } from "@/lib/auth-debug";

export async function GET() {
	const headers = getLastAuthHeaders();
	// Clear after read to avoid leaking between requests
	clearLastAuthHeaders();
	return new Response(JSON.stringify({ headers }), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}
