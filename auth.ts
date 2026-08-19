/*
 * @FilePath: \my-new-app\auth.ts
 * @LastEditTime: 2026-08-19 00:55:29
 */
// auth.ts
export const runtime = "nodejs";

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db.server";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

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

  // ⭐ ADD THESE LOGS ⭐
  events: {
    async signIn(message) {
      console.log("🔵 [NextAuth] SIGNIN EVENT FIRED");
      console.log(message);
    },
    async signOut(message) {
      console.log("🟣 [NextAuth] SIGNOUT EVENT FIRED");
      console.log(message);
    },
    async createUser(message) {
      console.log("🟢 [NextAuth] USER CREATED");
      console.log(message);
    },
    async linkAccount(message) {
      console.log("🟡 [NextAuth] ACCOUNT LINKED");
      console.log(message);
    },
  },

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("🔵 [NextAuth Callback] signIn()");
      console.log({ user, account, profile, email, credentials });
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("🟠 [NextAuth Callback] redirect()");
      console.log({ url, baseUrl });
      return url;
    },
    async session({ session, token, user }) {
      console.log("🟢 [NextAuth Callback] session()");
      console.log({ session, token, user });
      return session;
    },
    async jwt({ token, user, account, profile }) {
      console.log("🟣 [NextAuth Callback] jwt()");
      console.log({ token, user, account, profile });
      return token;
    },
  },
});
