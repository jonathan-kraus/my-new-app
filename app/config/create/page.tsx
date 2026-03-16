/*
 * @FilePath: \my-new-app\app\config\create\page.tsx
 * @LastEditTime: 2026-03-15 20:31:20
 */

import { logit } from "@/lib/log/logit";

export type config = {
	id: string;
	reason: string;
	message: string;
	Variable01: string;
	Variable02: string;
	Variable03: string;
};
export const dynamic = "force-dynamic";

export default async function AxiomConfig() {
	const requestId = crypto.randomUUID();
	const userId = "JK";
	const eventIndex = 22;
	await logit(
		"jonathan",
		{ level: "info", message: "In AxiomConfig" },
		{
			userid: userId,
			requestId,
			eventIndex,
		},
		{
			page: "page.tsx",
			zulu: new Date().toISOString(),
			local: new Date().toLocaleString("en-US", {}),
		},
	);
	//-------------------------------------------------------------------------
	try {
		const flightEvents = [
			{
				id: crypto.randomUUID(),
				reason: "Flight",
				message: "Config for favorite flights",
				Variable01: "AA1976",
				Variable02: "AA607",
				Variable03: "AA1211",
			},
		];
		const flightRes = await fetch("/api/config/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ events: flightEvents, dataset: "config" }),
		});
		const flightJson = await flightRes.json();
		if (!flightRes.ok || !flightJson.ok) {
			throw new Error(
				`Flight ingest failed ${flightRes.status} ${String(flightJson?.error ?? flightJson)}`,
			);
		}
		await logit(
			"jonathan",
			{ level: "info", message: "Flight call complete" },
			{ configmessage: "Config for favorite flights", flightResponse: flightJson },
			{
				page: "page.tsx",
				requestId,
				userId,
				eventIndex,
			},
		);
	} catch (error) {
		console.error("Axiom Flight ingest error", error);
		await logit(
			"jonathan",
			{ level: "error", message: "Flight call failed" },
			{ error: String(error) },
			{
				page: "page.tsx",
				requestId,
				userId,
				eventIndex,
			},
		);
	}

	try {
		const weatherEvents = [
			{
				id: crypto.randomUUID(),
				reason: "Weather",
				message: "Config for favorite cities",
				Variable01: "KOP",
				Variable02: "Brookline",
				Variable03: "Williamstown",
			},
		];
		const weatherRes = await fetch("/api/config/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ events: weatherEvents, dataset: "config" }),
		});
		const weatherJson = await weatherRes.json();
		if (!weatherRes.ok || !weatherJson.ok) {
			throw new Error(
				`Weather ingest failed ${weatherRes.status} ${String(weatherJson?.error ?? weatherJson)}`,
			);
		}
		await logit(
			"jonathan",
			{ level: "info", message: "Weather call complete" },
			{ configmessage: "Config for favorite cities", weatherResponse: weatherJson },
			{
				page: "page.tsx",
				requestId,
				userId,
				eventIndex,
			},
		);
	} catch (error) {
		console.error("Axiom Weather ingest error", error);
		await logit(
			"jonathan",
			{ level: "error", message: "Weather call failed" },
			{ error: String(error) },
			{
				page: "page.tsx",
				requestId,
				userId,
				eventIndex,
			},
		);
	}

	// --- Log the combined result --------------------------------------------
	await logit(
		"jonathan",
		{ level: "info", message: "Config Complete" },
		{},
		{
			page: "page.tsx",
			requestId,
			userId,
			eventIndex,
		},
	);

	// --- Render both API results --------------------------------------------
	return (
		<div className="p-6 space-y-8">
			<h1 className="text-xl font-bold mb-4">Result</h1>

			<pre className="bg-black/40 p-4 rounded text-green-300 text-sm overflow-auto">
				{JSON.stringify(
					{
						requestId,
					},
					null,
					2,
				)}
			</pre>
		</div>
	);
}
