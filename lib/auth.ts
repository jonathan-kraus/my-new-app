import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./prisma";

type AuthType = ReturnType<typeof betterAuth>;

let _auth: AuthType | undefined;
let _dbConnected = false;

export async function getAuth(): Promise<AuthType> {
	if (_auth) return _auth;

	try {
		if (!__DEV__ && !process.env.NODE_ENV) {
			// noop - keep typescript happy in some environments
		}
	} catch {}

	try {
		if (!_dbConnected) {
			// Ensure Prisma is connected before adapter initialization
			// eslint-disable-next-line no-await-in-loop
			await db.$connect();
			_dbConnected = true;
		}

		_auth = betterAuth({
			database: prismaAdapter(db, { provider: "postgres" }),
			socialProviders: {
				github: {
					clientId: process.env.GITHUB_CLIENT_ID!,
					clientSecret: process.env.GITHUB_CLIENT_SECRET!,
				},
			},
		});
	} catch (err: any) {
		// More detailed logs to help diagnose adapter init failures
		// eslint-disable-next-line no-console
		console.error("BetterAuth initialization failed:", {
			name: err?.name,
			message: err?.message,
			stack: err?.stack,
			cause: err?.cause,
		});
		// eslint-disable-next-line no-console
		console.error("ENV: DATABASE_URL set?", !!process.env.DATABASE_URL);
		// eslint-disable-next-line no-console
		console.error("ENV: GITHUB_CLIENT_ID set?", !!process.env.GITHUB_CLIENT_ID);
		// eslint-disable-next-line no-console
		console.error("ENV: GITHUB_CLIENT_SECRET set?", !!process.env.GITHUB_CLIENT_SECRET);
		throw err;
	}

	return _auth!;
}
