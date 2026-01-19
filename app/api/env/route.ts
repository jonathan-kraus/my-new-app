import { NextResponse } from "next/server";

export async function GET() {
  const env = {
    nodeEnv: process.env.NODE_ENV ?? null,
    betterAuthUrl: process.env.BETTER_AUTH_URL ?? null,
    nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    vercel: !!process.env.VERCEL,
    databaseUrlPresent: !!process.env.DATABASE_URL,
    prismaClientPresent: (() => {
      try {
        // check if Prisma client is importable without exposing client
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pkg = require("@prisma/client");
        return !!pkg?.PrismaClient;
      } catch (e) {
        return false;
      }
    })(),
    githubClientIdPresent: !!(
      process.env.GITHUB_CLIENT_ID ||
      process.env.GITHUB_ID ||
      process.env.AUTH_GITHUB_ID
    ),
    githubClientSecretPresent: !!(
      process.env.GITHUB_CLIENT_SECRET ||
      process.env.GITHUB_SECRET ||
      process.env.AUTH_GITHUB_SECRET
    ),
    betterAuthSecretPresent: !!process.env.BETTER_AUTH_SECRET,
    nextAuthPresent: !!(
      process.env.NEXTAUTH_URL || process.env.NEXTAUTH_SECRET
    ),
  };

  return NextResponse.json({ env });
}
