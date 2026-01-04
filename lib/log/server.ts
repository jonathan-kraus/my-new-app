import { headers } from "next/headers";
import { CreateLogInput } from "@/lib/types";

export async function logit(input: CreateLogInput) {
	const h = await headers();
	const requestId = h.get("x-request-id") ?? undefined;

	// Your existing DB log (100% reliable)
	fetch(`${process.env.SITE_URL}/api/log`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...input, requestId }),
	}).catch(console.error);

	// Axiom: Only runtime if envs present (no import needed)
	if (process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET) {
		(async () => {
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
			} catch (e) {
				console.error("Axiom optional log failed:", e);
			}
		})(); // IIFE = fire-and-forget
	}
}
