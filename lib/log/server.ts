import { headers } from "next/headers";
import { CreateLogInput } from "@/lib/types";

export async function logit(input: CreateLogInput) {
  const h = await headers();
  const requestId = h.get("x-request-id") ?? undefined;

  return fetch(`${process.env.SITE_URL}/api/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      requestId,
    }),
  });
}
