// lib/db.ts - PRISMA 7 + NEON ADAPTER
import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL!;
const sql = neon(connectionString);
const adapter = new PrismaNeon({ connectionString });
declare global {
	var prisma: PrismaClient | undefined; // ✅ TYPE FIX
}
export const db = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = db;
}
