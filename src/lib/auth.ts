import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

const AUTHORIZED_GITHUB_USERS = process.env.AUTHORIZED_GITHUB_USERS?.split(",") ?? [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    authorized: async ({ request, auth }) => {
      const pathname = request.nextUrl.pathname;

      // Protege rotas /admin
      if (pathname.startsWith("/admin")) {
        return !!auth?.user && auth.user.role === "ADMIN";
      }

      return true;
    },

    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },

    signIn: async ({ user, profile }) => {
      // Verifica se o usuário GitHub está autorizado
      if (profile?.login && !AUTHORIZED_GITHUB_USERS.includes(profile.login)) {
        return false;
      }
      return true;
    },

    jwt: async ({ token, user, account, profile }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "database",
  },
});
