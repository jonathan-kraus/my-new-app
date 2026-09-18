// auth.ts
export const runtime = "nodejs";

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { Prisma8Adapter } from "@/lib/auth-prisma8-adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: Prisma8Adapter(),

  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "database",
  },

  trustHost: true,
});
