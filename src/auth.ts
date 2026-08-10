import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "@/lib/prisma";

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId:
        process.env.AZURE_AD_CLIENT_ID!,
      clientSecret:
        process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId:
        process.env.AZURE_AD_TENANT_ID!,
    }),
  ],

  callbacks: {
    async jwt({
      token,
      profile,
    }) {
      const email =
        (profile as { email?: string })
          ?.email ?? token.email;

      if (email) {
        const user =
          await prisma.user.findUnique({
            where: {
              email,
            },
          });

        if (user) {
          token.role = user.role;
          token.userId = user.id;
        }
      }

      return token;
    },

    async session({
      session,
    }) {
      return session;
    },
  },
});