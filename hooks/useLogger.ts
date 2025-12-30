// hooks/useLogger.ts
"use client";
import { useCallback } from "react";

export function useLogger() {
	const log = useCallback(
		async (partial: {
			level: "info" | "warn" | "error" | "debug";
			message: string;
			data?: Record<string, any>;
		}) => {
			await fetch("/api/log", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(partial),
			});
		},
		[],
	);

	return { log };
}
