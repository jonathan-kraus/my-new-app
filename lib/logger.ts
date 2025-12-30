// lib/logger.ts - ONE CALL TO RULE THEM ALL
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { CreateLogInput } from "@/lib/types";
export interface LogMessage {
	level: "debug" | "info" | "warn" | "error";
	message: string;
	data?: Record<string, any>;
	timestamp?: Date;
	userId?: string;
	page?: string;
}

export async function appLog(msg: Omit<LogMessage, "timestamp">): Promise<{ success: boolean }> {
	const logData: LogMessage = {
		...msg,
		timestamp: new Date(),
	};

	// Client vs Server auto-detection
	if (typeof window === "undefined") {
		// SERVER - Direct database call
		return logToServer(logData);
	} else {
		// CLIENT - Fetch to API route
		return logToClient(logData);
	}
}

// CLIENT logger (fetch)
async function logToClient(data: LogMessage): Promise<{ success: boolean }> {
	try {
		const res = await fetch("/api/log", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		return { success: res.ok };
	} catch {
		console.log("Logger offline:", data.message); // Graceful fallback
		return { success: false };
	}
}

// SERVER logger (database)
async function logToServer(data: LogMessage): Promise<{ success: boolean }> {
	try {
		await db.log.create({
			data: {
				level: data.level,
				message: data.message,
				data: data.data ? (data.data as Prisma.InputJsonValue) : Prisma.JsonNull, // ✅ PRISMA 7 EXACT TYPE
				userId: data.userId,
				page: data.page,
			},
		});
		console.log("[SERVER LOG]", data);
		return { success: true };
	} catch {
		console.error("[LOGGER ERROR]", data);
		return { success: false };
	}
}
