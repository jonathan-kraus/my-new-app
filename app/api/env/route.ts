import { NextResponse } from "next/server";

export async function GET() {
  const env = {
    nodeEnv: process.env.NODE_ENV ?? null,

    nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    vercel: !!process.env.VERCEL,
    databaseUrlPresent: !!process.env.DATABASE_URL,
    prismaClientPresent: await (async () => {
      try {
        // Check the Prisma 8 runtime without opening a database connection.

        const pkg = await import("@prisma/orm-postgres/runtime");
        return typeof pkg.default === "function";
      } catch {
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

    nextAuthPresent: !!(
      process.env.NEXTAUTH_URL || process.env.NEXTAUTH_SECRET
    ),
  };

  return NextResponse.json({ env });
}
