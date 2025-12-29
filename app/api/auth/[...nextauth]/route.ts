// app/api/auth/[...nextauth]/route.ts ← EXPORT authOptions
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const authOptions = {
	providers: [
		GitHub({
			clientId: process.env.AUTH_GITHUB_ID!,
			clientSecret: process.env.AUTH_GITHUB_SECRET!,
		}),
	],
	secret: process.env.AUTH_SECRET!,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
