import type { NextAuthOptions, User, Session } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { loginSchema } from "@/features/auth/schemas/auth.schema"
import { z } from "zod"

// Extend the User type to include the role
interface ExtendedUser extends User {
  role?: string;
}

// Extend the Session type to include the role
interface ExtendedSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const validatedCredentials = loginSchema.parse(credentials)
          
          // TODO: Replace with your actual authentication logic
          if (
            validatedCredentials.email === "admin@example.com" &&
            validatedCredentials.password === "password123"
          ) {
            const user: ExtendedUser = {
              id: "1",
              email: validatedCredentials.email,
              name: "Admin User",
              role: "admin",
            };
            return user;
          }
          return null;
        } catch (error) {
          if (error instanceof z.ZodError) {
            // Return null if validation fails
            return null;
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as ExtendedUser).role;
      }
      return token;
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      if (extendedSession?.user) {
        extendedSession.user.role = token.role as string;
      }
      return extendedSession;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
