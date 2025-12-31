// lib/db.ts - WASM RUNTIME SAFE
import { PrismaClient } from "@prisma/client/edge";
import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL!;

let db: PrismaClient;

if (typeof window === "undefined") {
	// ✅ Server-only
	const adapter = new PrismaNeon({ connectionString });
	db = new PrismaClient({ adapter });
}

declare global {
	var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV !== "production") global.prisma = db!;

export { db };
