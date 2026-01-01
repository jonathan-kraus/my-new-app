import { betterAuth } from "better-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function getAuth() {
	return betterAuth({
		database: prisma,
		socialProviders: {
			github: {
				clientId: process.env.GITHUB_CLIENT_ID!,
				clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			},
		},
	});
}
