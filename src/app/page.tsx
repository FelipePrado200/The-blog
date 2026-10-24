import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FeaturedPost } from "@/components/FeaturedPost";
import { PostRow } from "@/components/PostRow";
import { getHomeData } from "@/lib/posts";
import { formatCount } from "@/lib/format";

export const metadata = {
  title: "The Blog",
  description:
    "Notas sobre engenharia de front-end, interface e as decisões que ficam de fora da documentação.",
};

export const revalidate = 60;

export default async function Home() {
  const { posts, tags, total, dbReady } = await getHomeData();

  const [featured, ...rest] = posts;

  return (
    <>
      <SiteHeader />

      <main
        className="mx-auto px-[var(--gutter)]"
        style={{ maxWidth: "var(--page)" }}
      >
        {/* ===== Masthead ===== */}
        <section className="pt-[var(--s-8)] pb-[var(--s-7)] sm:pt-[var(--s-9)]">
          <p
            className="rise label"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            Engenharia de front-end · Interface · Ofício
          </p>

          <h1
            className="rise font-display mt-[var(--s-5)] max-w-[20ch] text-[length:var(--t-display)] font-semibold leading-[var(--lh-display)] text-ink"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            O que a<br />
            <span style={{ fontStyle: "italic", fontWeight: 500 }}>
              documentação
            </span>
            <br />
            não conta.
          </h1>

          <p
            className="rise mt-[var(--s-6)] max-w-[48ch] text-[length:var(--t-lead)] leading-[var(--lh-lead)] text-ink-2"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            Artigos longos sobre as decisões difíceis de construir interface:
            desempenho medido, tipografia que resolve um problema, e o motivo
            de cada escolha técnica.
          </p>

          <div
            className="rise mt-[var(--s-7)] flex flex-wrap items-center gap-[var(--s-5)]"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <span className="mono tnum text-[length:var(--t-meta)] text-ink-3">
              {formatCount(total)} {total === 1 ? "artigo" : "artigos"}
            </span>
            {tags.length > 0 ? (
              <>
                <span aria-hidden className="text-ink-3">
                  ·
                </span>
                <span className="mono tnum text-[length:var(--t-meta)] text-ink-3">
                  {tags.length} {tags.length === 1 ? "tag" : "tags"}
                </span>
              </>
            ) : null}
          </div>
        </section>

        {/* ===== Aviso quando o banco não está configurado ===== */}
        {!dbReady ? (
          <section
            className="card rise p-[var(--s-6)]"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <p className="label" style={{ color: "var(--warn)" }}>
              Banco de dados não conectado
            </p>
            <p className="mt-[var(--s-3)] max-w-[60ch] text-[length:var(--t-ui)] leading-relaxed text-ink-2">
              O projeto está rodando, mas sem{" "}
              <code className="mono">DATABASE_URL</code>. Defina a variável no{" "}
              <code className="mono">.env.local</code> e rode{" "}
              <code className="mono">pnpm prisma migrate dev</code> para ver os
              artigos.
            </p>
          </section>
        ) : null}

        {/* ===== Artigo em destaque ===== */}
        {featured ? (
          <section className="pb-[var(--s-9)]">
            <FeaturedPost
              title={featured.title}
              slug={featured.slug}
              excerpt={featured.excerpt}
              content={featured.content}
              coverImage={featured.coverImage}
              publishedAt={featured.publishedAt}
              author={featured.author}
              tags={featured.tags}
            />
          </section>
        ) : null}

        {/* ===== Indice ===== */}
        {rest.length > 0 ? (
          <section className="pb-[var(--s-9)]">
            <div className="mb-[var(--s-5)] flex items-baseline justify-between gap-[var(--s-4)]">
              <h2 className="label">Todos os artigos</h2>
              <span className="mono tnum text-[length:var(--t-meta)] text-ink-3">
                {String(rest.length).padStart(2, "0")}
              </span>
            </div>

            <div style={{ borderBottom: "1px solid var(--line)" }}>
              {rest.map((post, i) => (
                <PostRow
                  key={post.id}
                  index={i}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  content={post.content}
                  publishedAt={post.publishedAt}
                  tags={post.tags}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* ===== Estado vazio ===== */}
        {dbReady && posts.length === 0 ? (
          <section className="card dotted grid place-items-center px-[var(--s-6)] py-[var(--s-9)] text-center">
            <p className="font-display text-[1.5rem] font-semibold text-ink">
              Nenhum artigo publicado ainda.
            </p>
            <p className="mt-[var(--s-3)] max-w-[44ch] text-[length:var(--t-ui)] text-ink-2">
              Entre no painel e escreva o primeiro. O editor aceita Markdown e
              MDX.
            </p>
            <Link
              href="/admin/login"
              className="btn btn-accent mt-[var(--s-6)]"
            >
              Abrir o painel
            </Link>
          </section>
        ) : null}

        {/* ===== Faixa de tags ===== */}
        {tags.length > 0 ? (
          <section className="pb-[var(--s-9)]">
            <h2 className="label">Explorar por tema</h2>
            <ul className="mt-[var(--s-5)] flex flex-wrap gap-[var(--s-2)]">
              {tags.map((tag, i) => (
                <li
                  key={tag.slug}
                  className="rise-fast"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <Link
                    href={`/tags/${tag.slug}`}
                    className="group inline-flex items-center gap-[var(--s-2)] border border-line px-[var(--s-4)] py-[var(--s-2)] text-[length:var(--t-ui)] text-ink-2 transition-[color,border-color,background-color] duration-200 ease-[var(--ease-io)] hover:border-accent-line hover:bg-accent-wash hover:text-accent"
                    style={{ borderRadius: "var(--r-full)" }}
                  >
                    {tag.name}
                    <span className="mono tnum text-[length:var(--t-micro)] text-ink-3 transition-colors duration-200 group-hover:text-accent">
                      {tag.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </>
  );
}
