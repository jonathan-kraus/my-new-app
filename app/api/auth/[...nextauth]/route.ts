import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "github") {
        token.githubId = account.providerAccountId;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.githubId = token.githubId;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
