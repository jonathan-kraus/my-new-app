import { headers } from "next/headers";
import { log } from "next-axiom"; // ✅ Official SDK
import { CreateLogInput } from "@/lib/types";

export async function logit(input: CreateLogInput) {
  const h = await headers();
  const requestId = h.get("x-request-id") ?? undefined;

  // 1. Your DB log
  fetch(`${process.env.SITE_URL}/api/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, requestId }),
  }).catch(console.error);

  // 2. Axiom (official, Turbopack-safe)
  log
    .with({ requestId, page: input.page })
    .info(input.message, { level: input.level, data: input.data });
}
