// lib/logger.ts - LAZY SESSION (no global call)
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../app/api/auth/[...nextauth]/route";
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
		// ✅ LAZY: Only call session INSIDE async function
		console.log(`[AUTO-LOG] ${msg.level.toUpperCase()}: ${msg.message}`, msg.data || {});
		const session = await getServerSession(authOptions);

		const logData: LogMessage = {
			...msg,
			userId: session?.user?.name || msg.userId || "anonymous",
			timestamp: new Date(),
		};

		await db.log.create({
			data: {
				level: logData.level,
				message: logData.message,
				data: logData.data ?? Prisma.JsonNull,
				userId: logData.userId,
				page: logData.page,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Log error:", error);
		return { success: false };
	}
}
