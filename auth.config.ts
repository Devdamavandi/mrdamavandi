


import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginZodSchema } from "./types/zod";
import { getUserByEmail } from "./lib/userQueries";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/db";
import Google from 'next-auth/providers/google'
import Github from 'next-auth/providers/github'

export default {
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
   },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginZodSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            // Only allow "ADMIN" or "USER" roles for NextAuth
            const safeRole: "ADMIN" | "USER" = user.role === "ADMIN" ? "ADMIN" : "USER";
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: safeRole,
            };
          }
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        token.role = user.role 
        token.sub = user.id
      }
      return token
    },
    async session({session, token}) {
      if (session.user && token.sub) {
        session.user.id = token.sub as string
      }
      if (session.user && token.role) {
        session.user.role = token.role as "ADMIN" | "USER"
      }
      return session
    },
    async redirect({url, baseUrl}) {
      return url.startsWith(baseUrl) ? url : baseUrl
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;