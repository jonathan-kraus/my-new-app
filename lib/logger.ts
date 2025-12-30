// lib/logger.ts - PRISMA JSON NULL FIXED
import { Prisma } from "@prisma/client"; // ✅ PRISMA NULL TYPES
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
				data: logData.data ?? Prisma.JsonNull, // ✅ PRISMA NULL
				userId: logData.userId,
				page: logData.page,
			},
		});

		console.log("[SERVER LOG]", logData);
		return { success: true };
	} catch (error) {
		console.error("Log error:", error);
		return { success: false };
	}
}
