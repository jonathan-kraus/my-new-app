// app/api/auth/[...nextauth]/route.ts ← EXPORT authOptions
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { appLog } from '@/lib/logger';

export const authOptions = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET!,
};
await appLog({ level: 'info', message: 'Prisma v7 working!', page: 'auth' });

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
