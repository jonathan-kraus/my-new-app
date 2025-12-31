// lib/db.ts - NO WASM = INSTANT FIX
import { PrismaClient } from "@prisma/client"; // ✅ Standard (no edge/neon)

declare global {
	var prisma: PrismaClient | undefined;
}

const db = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = db;

export { db };
