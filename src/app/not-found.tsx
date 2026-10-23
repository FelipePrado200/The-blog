import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main
        className="mx-auto grid min-h-[60vh] place-items-center px-[var(--gutter)] py-[var(--s-9)]"
        style={{ maxWidth: "var(--page)" }}
      >
        <div className="text-center">
          <p
            className="rise mono text-[var(--t-meta)] text-ink-3"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            404
          </p>
          <h1
            className="rise font-display mt-[var(--s-4)] text-[var(--t-h1)] font-semibold leading-[1.08] text-ink"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            Esta página não existe.
          </h1>
          <p
            className="rise mx-auto mt-[var(--s-5)] max-w-[40ch] text-[var(--t-lead)] leading-[var(--lh-lead)] text-ink-2"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            O endereço pode ter mudado, ou o artigo ainda está como rascunho.
          </p>
          <div
            className="rise mt-[var(--s-7)] flex flex-wrap justify-center gap-[var(--s-3)]"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <Link href="/" className="btn btn-accent">
              Ver os artigos
            </Link>
            <Link href="/tags" className="btn btn-ghost">
              Explorar por tema
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
