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
          // Create Google user if they don't exist
          await createGoogleUser(user.id, user.email || '', user.name || '');
        } catch (error) {
          console.log('User might already exist or creation failed:', error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        // Use Google's sub (subject) ID as our user identifier
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.sub = account.providerAccountId; // Google's user ID
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
