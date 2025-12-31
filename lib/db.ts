// lib/db.ts - NEON + TYPED GLOBAL
import { PrismaClient } from "@prisma/client/edge";
import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });

declare global {
	var prisma: PrismaClient | undefined;
}

const db = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") global.prisma = db;

export { db };
