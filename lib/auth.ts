import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./prisma";

type AuthType = ReturnType<typeof betterAuth>;

let _auth: AuthType | undefined;
let _dbConnected = false;

export async function getAuth(): Promise<AuthType> {
	if (_auth) return _auth;

	// no-op: ensure runtime env checks are handled via `process.env.NODE_ENV`

	try {
		if (!_dbConnected) {
			// Ensure Prisma is connected before adapter initialization
			// eslint-disable-next-line no-await-in-loop
			await db.$connect();
			_dbConnected = true;
		}

		const githubClientId =
			process.env.GITHUB_CLIENT_ID ?? process.env.GITHUB_ID ?? process.env.AUTH_GITHUB_ID;
		const githubClientSecret =
			process.env.GITHUB_CLIENT_SECRET ??
			process.env.GITHUB_SECRET ??
			process.env.AUTH_GITHUB_SECRET;

		const socialProviders: any = {};
		if (githubClientId && githubClientSecret) {
			socialProviders.github = {
				clientId: githubClientId,
				clientSecret: githubClientSecret,
			};
		} else {
			// eslint-disable-next-line no-console
			console.warn("GitHub OAuth not configured: missing GITHUB client id/secret env vars");
		}

		_auth = betterAuth({
			database: prismaAdapter(db, { provider: "postgresql" }),
			socialProviders: Object.keys(socialProviders).length ? socialProviders : undefined,
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
