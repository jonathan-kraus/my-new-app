// lib/logger.ts - PURE DB (no session/headers)
import { Prisma } from "@prisma/client";
import { db } from "./db";

export interface LogMessage {
	level: "info" | "warn" | "error" | "debug";
	message: string;
	data?: Record<string, any>;
	userId?: string;
	page?: string;
	timestamp: Date;
}

export async function appLog(msg: Omit<LogMessage, "timestamp">): Promise<{ success: boolean }> {
	try {
		console.log(`[AUTO-LOG] ${msg.level.toUpperCase()}: ${msg.message}`, msg.data || {});

		await db.log.create({
			data: {
				level: msg.level,
				message: msg.message,
				data: msg.data ?? Prisma.JsonNull,
				userId: msg.userId || "anonymous",
				page: msg.page || "unknown",
			},
		});

		console.log(`[DB-SAVED] ${msg.message}`);
		return { success: true };
	} catch (error) {
		console.error("DB Log error:", error);
		return { success: false };
	}
}
