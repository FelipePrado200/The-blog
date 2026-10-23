import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

/*
  Quem pode entrar no painel.
  Lista de nomes de usuário do GitHub, separados por vírgula,
  na variável AUTHORIZED_GITHUB_USERS.

  Se a lista ficar vazia, ninguém entra. Isso e de propósito:
  um painel aberto por engano e pior do que um painel trancado.
*/
function allowedLogins(): string[] {
  return (process.env.AUTHORIZED_GITHUB_USERS ?? "")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: { strategy: "database" },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  callbacks: {
    /* Porta de entrada. Roda antes de criar a conta. */
    async signIn({ profile }) {
      const allowed = allowedLogins();
      const login = String(profile?.login ?? "").toLowerCase();

      if (allowed.length === 0) {
        console.warn(
          "[auth] AUTHORIZED_GITHUB_USERS está vazia. Nenhum login foi aceito."
        );
        return false;
      }

      return allowed.includes(login);
    },

    /* Leva o id e o papel para dentro da sessão. */
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },

    /* Protege /admin quando o middleware estiver ativo. */
    authorized({ request, auth: session }) {
      if (request.nextUrl.pathname.startsWith("/admin/login")) return true;

      if (request.nextUrl.pathname.startsWith("/admin")) {
        return Boolean(session?.user && session.user.role === "ADMIN");
      }

      return true;
    },
  },
});
