"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function useLogger() {
	const pathname = usePathname();
	const { data: session } = useSession();

	async function log(level: string, message: string, data: any = null) {
		try {
			await fetch("/api/log", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					level,
					message,
					data,
					page: pathname,
					userId: 1234,
					sessionEmail: session?.user?.email ?? null,
					sessionUser: session?.user?.name ?? null,
				}),
			});
		} catch (err) {
			console.error("Failed to send log:", err);
		}
	}

	return {
		info: (msg: string, data?: any) => log("INFO", msg, data),
		warn: (msg: string, data?: any) => log("WARN", msg, data),
		error: (msg: string, data?: any) => log("ERROR", msg, data),
	};
}
