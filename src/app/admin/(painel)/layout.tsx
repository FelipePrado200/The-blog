import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { countPendingComments } from "@/lib/comments";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/comments", label: "Comentários", badge: true },
  { href: "/admin/tags", label: "Tags" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const pending = await countPendingComments(session.user.id);

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--panel)" }}
    >
      {/* ===== Barra lateral ===== */}
      <aside
        className="hidden w-[248px] shrink-0 flex-col border-r border-line md:flex"
        style={{ background: "var(--paper)" }}
      >
        {/* Marca */}
        <div className="flex h-[72px] items-center gap-[10px] border-b border-line px-[var(--s-5)]">
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "var(--accent)",
            }}
          />
          <div>
            <p className="font-display text-[1rem] font-semibold leading-none text-ink">
              The Blog
            </p>
            <p className="label mt-[3px]">Painel</p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-[var(--s-3)] py-[var(--s-5)]">
          <ul className="space-y-[2px]">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-10 items-center justify-between rounded-[var(--r-sm)] px-[var(--s-3)] text-[var(--t-ui)] text-ink-2 transition-[color,background-color] duration-200 ease-[var(--ease-io)] hover:bg-panel hover:text-ink"
                >
                  {item.label}
                  {item.badge && pending > 0 ? (
                    <span
                      className="mono tnum"
                      style={{
                        fontSize: "var(--t-micro)",
                        minWidth: 20,
                        height: 20,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "var(--r-full)",
                        background: "var(--accent)",
                        color: "var(--accent-ink)",
                        padding: "0 6px",
                      }}
                    >
                      {pending}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-[var(--s-6)] border-t border-line pt-[var(--s-5)]">
            <Link
              href="/"
              target="_blank"
              className="flex h-10 items-center gap-[var(--s-2)] rounded-[var(--r-sm)] px-[var(--s-3)] text-[var(--t-ui)] text-ink-3 transition-colors duration-200 hover:text-ink"
            >
              Ver o site
              <svg
                viewBox="0 0 16 16"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M6 3h7v7M13 3 5 11" />
              </svg>
            </Link>
          </div>
        </nav>

        {/* Pessoa conectada */}
        <div className="border-t border-line p-[var(--s-4)]">
          <div className="flex items-center gap-[var(--s-3)]">
            {session.user.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={session.user.image}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-full border border-line"
              />
            ) : (
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-full border border-line text-[var(--t-meta)] text-ink-3"
                style={{ background: "var(--panel)" }}
              >
                {(session.user.name ?? "?")[0]?.toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[var(--t-meta)] font-medium text-ink">
                {session.user.name}
              </p>
              <p className="truncate text-[var(--t-micro)] text-ink-3">
                {session.user.email}
              </p>
            </div>
            <ThemeToggle />
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="mt-[var(--s-3)] w-full rounded-[var(--r-sm)] border border-line py-[var(--s-2)] text-[var(--t-meta)] text-ink-2 transition-[color,border-color] duration-200 hover:border-ink-3 hover:text-ink"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* ===== Conteúdo ===== */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
