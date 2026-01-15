import { betterAuth } from "better-auth";

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

export const auth = betterAuth({
  baseURL: "https://www.kraus.my.id",
  trustedOrigins: ["https://www.kraus.my.id", "https://kraus.my.id"],

  callbacks: {
    session: async ({
      session,
      user,
    }: {
      session: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date;
        token: string;
        ipAddress?: string | null;
        userAgent?: string | null;
      };
      user: {
        id: string;
        email: string;
        name: string | null;
      };
    }) => ({
      ...session,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }),
  },

  socialProviders:
    Object.keys(socialProviders).length > 0 ? socialProviders : undefined,
});
