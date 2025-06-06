import NextAuth from 'next-auth';
import type { DefaultSession, NextAuthConfig, User as NextAuthUser } from 'next-auth';
import { UserRole } from './auth/roles';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user']
  }
}

interface JWT {
  id?: string;
  role?: UserRole;
}

interface CustomUser extends NextAuthUser {
  id: string;
  role: UserRole;
}

export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        return {
          ...token,
          id: customUser.id,
          role: customUser.role
        };
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        session.user.id = token.id || '';
        session.user.role = token.role || UserRole.USER;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
};

export const { auth } = NextAuth(authConfig); 