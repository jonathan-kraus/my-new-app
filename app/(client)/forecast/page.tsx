// app/forecast/page.tsx - COMPACT
"use client";
import { SessionProvider } from "next-auth/react";
import ClientNav from "@/app/ClientNav";
import { appLog } from "@/lib/logger";
import { useCallback } from "react";

appLog({
	level: "info",
	message: "initializing forecast page",
	page: "forecast",
	data: { endpoint: "app/forecast/page.tsx", createdAt: new Date().toISOString() },
});
export default function Forecast() {
	const logTest = useCallback(async () => {
		await fetch("/api/log", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				level: "info" as const,
				message: "TEST LOG",
				data: { page: window.location.pathname },
			}),
		});
	}, []);
	logTest();
	return (
		<SessionProvider>
			<ClientNav />
			<div className="max-w-4xl space-y-6 py-4">
				<h1 className="text-3xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
					7-Day Forecast
				</h1>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
					{Array.from({ length: 7 }, (_, i) => (
						<div
							key={i}
							className="bg-white/70 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/50 text-center h-32 flex flex-col justify-center"
						>
							<p className="text-sm font-bold text-gray-900 mb-2">Thu</p>
							<div className="text-2xl mx-auto mb-2">☀️</div>
							<p className="text-2xl font-bold text-gray-900">72°</p>
							<p className="text-xs text-gray-600">Sunny</p>
						</div>
					))}
				</div>
			</div>
		</SessionProvider>
	);
}
