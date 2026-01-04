import { headers } from "next/headers";
import { CreateLogInput } from "@/lib/types";

export async function logit(input: CreateLogInput) {
  const h = await headers();
  const requestId = h.get("x-request-id") ?? undefined;

  // 1. ALWAYS: Your existing DB log via /api/log
  fetch(`${process.env.SITE_URL}/api/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, requestId }),
  }).catch(console.error);

  // 2. OPTIONAL: Axiom dual-logging (dynamic import = Turbopack-safe)
  if (process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET) {
    try {
      const { AxiomRequest } = await import("axiom");
      const axiom = new AxiomRequest({
        token: process.env.AXIOM_TOKEN!,
        dataset: process.env.AXIOM_DATASET!,
      });

      await axiom.ingest({
        level: input.level,
        message: input.message,
        page: input.page,
        data: input.data || {},
        requestId,
        "@timestamp": new Date().toISOString(),
      });
    } catch (axiomError) {
      console.error("Axiom log failed:", axiomError);
    }
  }
}
