// lib/db.ts - NEON API FIXED
import { PrismaClient } from "@prisma/client/edge";
import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString }); // ✅ connectionString NOT sql

declare global {
	var prisma: undefined | ReturnType<typeof getPrismaClient>;
}

function getPrismaClient() {
	return new PrismaClient({ adapter });
}

export const db = globalThis.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
