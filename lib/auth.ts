import { betterAuth } from "better-auth";
import { db } from "./prisma";

let _auth: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
	if (_auth) return _auth;

	try {
		_auth = betterAuth({
			database: db,
			socialProviders: {
				github: {
					clientId: process.env.GITHUB_CLIENT_ID!,
					clientSecret: process.env.GITHUB_CLIENT_SECRET!,
				},
			},
		});
	} catch (err) {
		// Log helpful debug info for adapter initialization failures
		// Avoid printing secrets; only show presence/absence of vars
		// so user can paste this output when reporting the error.
		// eslint-disable-next-line no-console
		console.error("BetterAuth initialization failed:", err);
		// eslint-disable-next-line no-console
		console.error("ENV: DATABASE_URL set?", !!process.env.DATABASE_URL);
		// eslint-disable-next-line no-console
		console.error("ENV: GITHUB_CLIENT_ID set?", !!process.env.GITHUB_CLIENT_ID);
		// eslint-disable-next-line no-console
		console.error("ENV: GITHUB_CLIENT_SECRET set?", !!process.env.GITHUB_CLIENT_SECRET);
		throw err;
	}

	return _auth;
}
