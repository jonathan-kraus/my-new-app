// hooks/useLogger.ts - React Hook wrapper
"use client";
import { useCallback } from "react";
import { appLog, LogMessage } from "@/lib/logger";

export function useLogger() {
	const log = useCallback(async (partial: Omit<LogMessage, "timestamp">) => {
		return appLog(partial);
	}, []);

	return {
		debug: (msg: string, data?: any) => log({ level: "debug", message: msg, data }),
		info: (msg: string, data?: any) => log({ level: "info", message: msg, data }),
		warn: (msg: string, data?: any) => log({ level: "warn", message: msg, data }),
		error: (msg: string, data?: any) => log({ level: "error", message: msg, data }),
	};
}
