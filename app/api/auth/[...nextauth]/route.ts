import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';

import { createGoogleUser } from '@/app/src/consumers/postgresConsumer';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.id) {
        try {
          await createGoogleUser(user.id, user.email || '', user.name || '');
        } catch (error) {
          // User might already exist, that's fine
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  trustHost: true,
} as NextAuthOptions;

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
