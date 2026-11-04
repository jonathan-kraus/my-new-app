import { withRequestTiming } from "@/lib/log/with-request-timing";
// app/api/debug-auth-headers/route.ts

import {
  getLastAuthResponseHeaders,
  clearLastAuthResponseHeaders,
  getLastAuthRequestHeaders,
  clearLastAuthRequestHeaders,
} from "@/lib/auth-debug";

async function GETHandler() {
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

export const GET = withRequestTiming("GET", "/debug-auth-headers", GETHandler);
