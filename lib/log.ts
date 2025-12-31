// lib/log.ts
import { useSession } from "next-auth/react";

export function useLogger() {
	const session = typeof window !== "undefined" ? useSession() : null;

	function info(message: string, data?: Record<string, any>) {
		if (typeof window === "undefined") return; // SSR guard

		const payload = {
			level: "info",
			message,
			userId: 12345, // optional: set server-side if needed
			page: window.location.pathname,
			ipAddress: null, // optional: set server-side if needed
			data,
			createdAt: new Date().toISOString(),
		};

		fetch("/api/log", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
	}

	return { info };
}
