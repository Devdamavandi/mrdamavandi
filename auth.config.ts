


import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
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
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = loginZodSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            // Only allow "ADMIN" or "USER" roles for NextAuth
            const safeRole: "ADMIN" | "CUSTOMER" = user.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
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
    async jwt({ token }: { token: JWT }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub }
      })
      if (dbUser) {
        token.role = dbUser.role // Use the latest DB value
        token.sub = dbUser.id
      }
      return token
    },
    // Session Callback
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.sub) {
        session.user.id = token.sub as string
      }
      if (session.user && token.role) {
        session.user.role = token.role as "ADMIN" | "CUSTOMER"
      }
      // Fetch latest user image from DB
      if (session.user && session.user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        })
        if (dbUser?.image) {
          session.user.image = dbUser.image
        }
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
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