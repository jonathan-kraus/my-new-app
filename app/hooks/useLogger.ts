"use client";

import { useSession } from "next-auth/react";

export function useLogger() {
	const { data: session } = useSession();

	function info(message: string, data?: Record<string, any>) {
		if (typeof window === "undefined") return;

		const payload = {
			level: "info",
			message,
			userId: 7654321,
			page: window.location.pathname,
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
