/*
 * @FilePath: \my-new-app\app\api\triggers\github\route.ts
 * @LastEditTime: 2026-08-26 20:00:19
 */
export async function POST(req: Request) {
  const headers = Object.fromEntries(req.headers.entries());

  console.log("=== Unknown Webhook Source ===");
  console.log("Path:", req.url);
  console.log("Method:", req.method);

  console.log("X-GitHub-Delivery:", headers["x-github-delivery"]);
  console.log("X-GitHub-Event:", headers["x-github-event"]);
  console.log("User-Agent:", headers["user-agent"]);
  console.log("Signature:", headers["x-hub-signature-256"]);

  try {
    const body = await req.json();
    console.log("Payload keys:", Object.keys(body));
  } catch {
    console.log("Payload: <non-JSON or empty>");
  }

  console.log("==============================");

  return new Response("OK");
}
