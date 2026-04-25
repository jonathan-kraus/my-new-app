/*
 * @FilePath: \my-new-app\app\logs\axiom\LiveLogs.tsx
 * @LastEditTime: 2026-04-25 01:43:15
 */
"use client";

import { useEffect, useState } from "react";

export default function LiveLogs() {
	const [logs, setLogs] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	async function fetchLogs() {
		const res = await fetch("/api/logs/live", { cache: "no-store" });
		const json = await res.json();
		console.log("logs response:", json);
		setLogs(json.logs ?? []);
		setLoading(false);
	}

	useEffect(() => {
		fetchLogs();
		const id = setInterval(fetchLogs, 22222);
		return () => clearInterval(id);
	}, []);

	if (loading) {
		return <div className="text-gray-400">Loading logs…</div>;
	}

	return (
		<div className="space-y-3">
			{logs.map((log, i) => (
				<div key={i} className="p-4 rounded-lg bg-black/40 border border-white/10 text-sm">
					<div className="flex justify-between">
						<span className="font-semibold text-blue-300">{log.domain}</span>
						<span className="text-gray-400">
							{log._time ? new Date(log._time).toLocaleTimeString() : ""}
						</span>
					</div>
					<div className="mt-1 text-white">Msg: {log.message}</div>
					<div className="mt-1 text-white">File: {log.file}</div>
					<div className="mt-1 text-white">Line: {log.line}</div>
					if (log.level !== 'info') {
					<div className="mt-1 text-xs text-gray-500">Level: {log.level}</div>
					}
				</div>
			))}
		</div>
	);
}
