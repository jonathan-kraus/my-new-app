/*
 * @FilePath: \my-new-app\app\api\triggers\github\route.ts
 * @LastEditTime: 2026-08-26 20:12:45
 */
export async function POST(req: Request) {
  const headers = {
    delivery: req.headers.get("x-github-delivery"),
    event: req.headers.get("x-github-event"),
    userAgent: req.headers.get("user-agent"),
    signature: req.headers.get("x-hub-signature-256"),
  };

  console.log("=== Unknown Webhook Source ==X=");
  console.log("Path:", req.url);
  console.log("Method:", req.method);

  console.log("X-GitHub-Delivery:", headers.delivery);
  console.log("X-GitHub-Event:", headers.event);
  console.log("User-Agent:", headers.userAgent);
  console.log("Signature:", headers.signature);

  try {
    const body = await req.json();
    console.log("Payload keys:", Object.keys(body));
  } catch {
    console.log("Payload: <non-JSON or empty>");
  }

  console.log("==============================");

  return new Response("OK");
}
