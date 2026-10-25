import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

const ERROR_TEXT: Record<string, string> = {
  AccessDenied:
    "Esta conta do GitHub não está na lista de acesso. Adicione o nome de usuário em AUTHORIZED_GITHUB_USERS.",
  Configuration:
    "Falta configurar o login. Confira GITHUB_ID, GITHUB_SECRET e AUTH_SECRET no ambiente.",
  OAuthAccountNotLinked:
    "Este e-mail já existe com outro meio de entrada.",
  Verification: "O link expirou. Tente entrar outra vez.",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/admin/posts");
  }

  const { error } = await searchParams;
  const message = error
    ? (ERROR_TEXT[error] ?? "Não foi possível entrar. Tente outra vez.")
    : null;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* ===== Lado da marca ===== */}
      <aside
        className="dotted relative hidden flex-col justify-between overflow-hidden border-r border-line p-[var(--s-8)] lg:flex"
        style={{ background: "var(--panel)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 70% at 15% 0%, var(--accent-wash), transparent 62%)",
          }}
        />

        <div className="relative flex items-center gap-[10px]">
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "var(--accent)",
            }}
          />
          <span className="font-display text-[1.0625rem] font-semibold text-ink">
            The Blog
          </span>
        </div>

        <div className="relative">
          <p
            className="rise label"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            Painel de escrita
          </p>
          <p
            className="rise font-display mt-[var(--s-4)] max-w-[20ch] text-[clamp(2rem,3.2vw,2.75rem)] font-semibold leading-[1.1] text-ink"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            Escreva, revise, publique.
          </p>
          <p
            className="rise mt-[var(--s-5)] max-w-[38ch] text-[length:var(--t-ui)] leading-[1.6] text-ink-2"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            O editor aceita Markdown e MDX, guarda rascunho sozinho e mostra
            uma prévia antes de publicar.
          </p>
        </div>

        <p className="relative mono text-[length:var(--t-micro)] text-ink-3">
          Next.js · Prisma · PostgreSQL
        </p>
      </aside>

      {/* ===== Lado do acesso ===== */}
      <main
        className="relative grid place-items-center px-[var(--gutter)] py-[var(--s-8)]"
        style={{ background: "var(--paper)" }}
      >
        <div className="absolute right-[var(--s-5)] top-[var(--s-5)]">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[380px]">
          <h1
            className="rise font-display text-[1.75rem] font-semibold leading-[1.15] text-ink"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            Entrar no painel
          </h1>
          <p
            className="rise mt-[var(--s-3)] text-[length:var(--t-ui)] leading-[1.6] text-ink-2"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            O blog continua aberto para qualquer visitante. Esta porta serve
            apenas para escrever e moderar.
          </p>

          {message ? (
            <p
              role="alert"
              className="rise mt-[var(--s-5)] px-[var(--s-4)] py-[var(--s-3)] text-[length:var(--t-meta)] leading-[1.5]"
              style={
                {
                  "--i": 2,
                  borderRadius: "var(--r-sm)",
                  background: "var(--danger-wash)",
                  color: "var(--danger)",
                } as React.CSSProperties
              }
            >
              {message}
            </p>
          ) : null}

          {/* Entrar com GitHub */}
          <form
            className="rise mt-[var(--s-6)]"
            style={{ "--i": 3 } as React.CSSProperties}
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/admin/posts" });
            }}
          >
            <button type="submit" className="btn btn-primary w-full">
              <svg
                viewBox="0 0 20 20"
                width="17"
                height="17"
                fill="currentColor"
                aria-hidden
              >
                <path d="M10 0C4.48 0 0 4.48 0 10c0 4.42 2.87 8.17 6.84 9.49.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.46-3.37-1.46-.46-1.15-1.1-1.46-1.1-1.46-.88-.6.07-.58.07-.58.97.07 1.48.99 1.48.99.88 1.5 2.3 1.07 2.86.82.09-.64.34-1.07.62-1.32-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33s1.7.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.82-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .26.18.59.68.48C17.13 18.17 20 14.42 20 10c0-5.52-4.48-10-10-10z" />
              </svg>
              Continuar com GitHub
            </button>
          </form>

          <div
            className="rise mt-[var(--s-6)] border-t border-line pt-[var(--s-5)]"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <p className="label">Como o acesso funciona</p>
            <p className="mt-[var(--s-3)] text-[length:var(--t-meta)] leading-[1.6] text-ink-2">
              Somente os nomes de usuário listados em{" "}
              <code className="mono">AUTHORIZED_GITHUB_USERS</code> conseguem
              criar uma conta. Qualquer outra tentativa é barrada.
            </p>
          </div>

          <p
            className="rise mt-[var(--s-7)] text-center"
            style={{ "--i": 5 } as React.CSSProperties}
          >
            <Link
              href="/"
              className="text-[length:var(--t-meta)] text-ink-3 link-grow hover:text-ink"
            >
              Voltar ao blog
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
