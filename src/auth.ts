import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        const user =
          await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

        if (
          !user ||
          !user.passwordHash
        ) {
          return null;
        }

        const passwordValid =
          await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
    }) {
      if (user) {
        token.role = Reflect.get(
          user,
          "role"
        );
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (session.user) {
        Reflect.set(
          session.user,
          "role",
          token.role
        );
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret:
    process.env.NEXTAUTH_SECRET,
};