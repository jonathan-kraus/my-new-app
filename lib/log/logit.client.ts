// lib/log/logit.client.ts
export async function logit(
  domain: string,
  event: any = {},
  payload: any = {},
  meta: any = {},
) {
  console.log("logit.client called");

  try {
    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        domain,
        event,
        payload,
        meta,
      }),
    });

    if (!res.ok) {
      console.error("Client log failed with status", res.status);
    }
  } catch (err) {
    console.error("Client-side log failed", err);
  }
}
