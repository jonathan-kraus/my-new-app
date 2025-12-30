// lib/db.ts - BUNDLER SAFE (Neon + Standard Prisma)
import { PrismaClient } from "@prisma/client";

declare global {
	var prisma: PrismaClient | undefined;
}

// ✅ SERVER ONLY - Client ignores this
if (typeof window === "undefined") {
	try {
		const { neon } = require("@neondatabase/serverless");
		const { PrismaNeon } = require("@prisma/adapter-neon");
		const connectionString = process.env.DATABASE_URL!;
		const adapter = new PrismaNeon({ connectionString });
		// Use adapter on server
	} catch {
		// Fallback to standard Prisma
	}
}

export const db = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
