import { betterAuth } from "better-auth";
import { logit } from "@/lib/log/server";

type AuthType = ReturnType<typeof betterAuth>;

let _auth: AuthType | undefined;

// Build social providers from environment at module load
const githubClientId =
  process.env.GITHUB_CLIENT_ID ??
  process.env.GITHUB_ID ??
  process.env.AUTH_GITHUB_ID;

const githubClientSecret =
  process.env.GITHUB_CLIENT_SECRET ??
  process.env.GITHUB_SECRET ??
  process.env.AUTH_GITHUB_SECRET;

const socialProviders: Record<string, any> = {};

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

  callbacks: {
  session: async ({
    session,
    user,
  }: {
    session: Record<string, any>;
    user: { id: string; email: string; name: string | null };
  }) => {
    return {
      ...session,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  },
},


  socialProviders:
    Object.keys(socialProviders).length > 0 ? socialProviders : undefined,
});

// ⭐ MUST remain sync — Better Auth requires this
export function getAuth(): AuthType {
  if (_auth) return _auth;

  logit({
    level: "warn",
    message: "getAuth() called before auth initialized",
    file: "lib/auth.ts",
  });

  try {
    if (!Object.keys(socialProviders).length) {
      console.warn(
        "GitHub OAuth not configured: missing GITHUB client id/secret env vars",
      );
    }

    _auth = auth;

    logit({
      level: "info",
      message: "Better Auth initialized",
      file: "lib/auth.ts",
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
