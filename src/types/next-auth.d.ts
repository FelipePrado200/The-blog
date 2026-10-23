import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

/*
  Acrescenta id e role ao usuário da sessão.
  Sem isto, session.user.role não existe para o TypeScript.
*/
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role: UserRole;
  }
}
