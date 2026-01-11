import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./prisma";
import { logit } from "@/lib/log/server";

type AuthType = ReturnType<typeof betterAuth>;

let _auth: AuthType | undefined;
let _dbConnected = false;

// Build social providers from environment at module load so the CLI can read `auth`
const githubClientId =
  process.env.GITHUB_CLIENT_ID ??
  process.env.GITHUB_ID ??
  process.env.AUTH_GITHUB_ID;
const githubClientSecret =
  process.env.GITHUB_CLIENT_SECRET ??
  process.env.GITHUB_SECRET ??
  process.env.AUTH_GITHUB_SECRET;

const socialProviders: any = {};

if (githubClientId && githubClientSecret) {
  socialProviders.github = {
    clientId: githubClientId,
    clientSecret: githubClientSecret,
    user: { requireEmail: false },
    scope: ["read:user", "user:email"],
  };
}

// Export a named `auth` instance so the Better Auth CLI can detect the config.
export const auth = betterAuth({
  baseURL: "https://www.kraus.my.id",
  trustedOrigins: ["https://www.kraus.my.id", "https://kraus.my.id"],
  database: prismaAdapter(db, { provider: "postgresql" }),
  socialProviders: Object.keys(socialProviders).length
    ? socialProviders
    : undefined,
});

// ⭐ FIX: getAuth MUST NOT be async
export function getAuth(): AuthType {
  if (_auth) return _auth;

  // optional logging — safe to keep
  logit({
    level: "warn",
    message: "in getAuth - _auth is undefined",
    file: "lib/auth.ts",
    line: 45,
  });

  try {
    if (!_dbConnected) {
      // Prisma connect is async, but we do NOT await it here.
      // Better Auth does not require DB to be connected synchronously.
      db.$connect();
      _dbConnected = true;
    }

    if (!Object.keys(socialProviders).length) {
      console.warn(
        "GitHub OAuth not configured: missing GITHUB client id/secret env vars",
      );
    }

    _auth = auth;

    logit({
      level: "info",
      message: "in getAuth - what is auth",
      file: "lib/auth.ts",
      line: 70,
      data: { auth: JSON.stringify(_auth) },
    });
  } catch (err: any) {
    console.error("BetterAuth initialization failed:", {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
      cause: err?.cause,
    });
    console.error("ENV: DATABASE_URL set?", !!process.env.DATABASE_URL);
    console.error("ENV: GITHUB_CLIENT_ID set?", !!process.env.GITHUB_CLIENT_ID);
    console.error(
      "ENV: GITHUB_CLIENT_SECRET set?",
      !!process.env.GITHUB_CLIENT_SECRET,
    );
    throw err;
  }

  return _auth!;
}
