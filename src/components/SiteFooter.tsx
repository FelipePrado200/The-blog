import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div
        className="mx-auto grid gap-[var(--s-7)] px-[var(--gutter)] py-[var(--s-8)] sm:grid-cols-[1.4fr_1fr_1fr]"
        style={{ maxWidth: "var(--page)" }}
      >
        <div>
          <p className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">
            The Blog
          </p>
          <p className="mt-[var(--s-3)] max-w-[34ch] text-[var(--t-ui)] leading-relaxed text-ink-2">
            Notas sobre engenharia de front-end, interface e as decisões que
            ficam de fora da documentação.
          </p>
        </div>

        <nav>
          <p className="label">Ler</p>
          <ul className="mt-[var(--s-4)] space-y-[var(--s-2)] text-[var(--t-ui)]">
            <li>
              <Link href="/" className="link-grow text-ink-2 hover:text-ink">
                Todos os artigos
              </Link>
            </li>
            <li>
              <Link href="/tags" className="link-grow text-ink-2 hover:text-ink">
                Tags
              </Link>
            </li>
            <li>
              <Link href="/feed.xml" className="link-grow text-ink-2 hover:text-ink">
                Feed RSS
              </Link>
            </li>
          </ul>
        </nav>

        <nav>
          <p className="label">Contato</p>
          <ul className="mt-[var(--s-4)] space-y-[var(--s-2)] text-[var(--t-ui)]">
            <li>
              <a
                href="https://github.com/FelipePrado200"
                target="_blank"
                rel="noopener noreferrer"
                className="link-grow text-ink-2 hover:text-ink"
              >
                GitHub
              </a>
            </li>
            <li>
              <Link href="/sobre" className="link-grow text-ink-2 hover:text-ink">
                Sobre o autor
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-line-soft">
        <div
          className="mx-auto flex flex-wrap items-center justify-between gap-[var(--s-3)] px-[var(--gutter)] py-[var(--s-5)]"
          style={{ maxWidth: "var(--page)" }}
        >
          <p className="mono text-[var(--t-meta)] text-ink-3">
            © {year} The Blog
          </p>
          <p className="mono text-[var(--t-meta)] text-ink-3">
            Next.js · Prisma · PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  );
}
