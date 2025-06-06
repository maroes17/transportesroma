import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { connectDB } from './db';
import { User } from '@/models/User';
import { NextAuthConfig } from 'next-auth';
import { UserRole } from './auth/roles';

interface CustomUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Por favor ingrese su correo electrónico y contraseña');
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error('No existe una cuenta con este correo electrónico');
          }

          const isPasswordValid = await compare(
            credentials.password as string,
            user.password as string
          );

          if (!isPasswordValid) {
            throw new Error('Contraseña incorrecta');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          } as CustomUser;
        } catch (error) {
          console.error('Error en la autenticación:', error);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('Error al iniciar sesión');
        }
      }
    })
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.role = customUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth(authConfig); 