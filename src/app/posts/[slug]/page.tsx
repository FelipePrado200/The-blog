import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ViewCounter } from "@/components/ViewCounter";
import { Comments } from "@/components/Comments";
import { PostRow } from "@/components/PostRow";

import { getPostBySlug, getPublishedPosts, getRelatedPosts } from "@/lib/posts";
import { getApprovedComments } from "@/lib/comments";
import { formatFullDate, isoDate, readingTime, formatCount } from "@/lib/format";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED") {
    return { title: "Artigo não encontrado" };
  }

  const description =
    post.excerpt ?? post.content.replace(/[#*`>_\[\]]/g, "").slice(0, 155);

  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: isoDate(post.publishedAt),
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    alternates: { canonical: `/posts/${post.slug}` },
  };
}

export async function generateStaticParams() {
  const { posts } = await getPublishedPosts(100, 0);
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const tagSlugs = post.tags.map((t) => t.tag.slug);

  const [comments, related] = await Promise.all([
    getApprovedComments(post.id),
    getRelatedPosts(post.id, tagSlugs, 3),
  ]);

  const minutes = readingTime(post.content);

  return (
    <>
      <ReadingProgress />
      <ViewCounter slug={post.slug} />
      <SiteHeader />

      <article>
        {/* ===== Cabecalho do artigo ===== */}
        <header
          className="mx-auto px-[var(--gutter)] pt-[var(--s-8)] pb-[var(--s-7)]"
          style={{ maxWidth: "var(--page)" }}
        >
          {/* Caminho de volta */}
          <nav
            className="rise mb-[var(--s-6)]"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-[var(--s-2)] text-[length:var(--t-meta)] text-ink-3 transition-colors duration-200 ease-[var(--ease-io)] hover:text-ink"
            >
              <svg
                viewBox="0 0 16 16"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden
                className="transition-transform duration-300 ease-[var(--ease)] group-hover:-translate-x-[3px]"
              >
                <path d="M13 8H4M7.5 4.5 4 8l3.5 3.5" />
              </svg>
              Todos os artigos
            </Link>
          </nav>

          {/* Tags */}
          {post.tags.length > 0 ? (
            <ul
              className="rise mb-[var(--s-5)] flex flex-wrap gap-[var(--s-2)]"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              {post.tags.map(({ tag }) => (
                <li key={tag.slug}>
                  <Link
                    href={`/tags/${tag.slug}`}
                    className="label inline-block px-[var(--s-3)] py-[5px] transition-colors duration-200 ease-[var(--ease-io)]"
                    style={{
                      borderRadius: "var(--r-full)",
                      background: "var(--accent-wash)",
                      color: "var(--accent)",
                    }}
                  >
                    {tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {/* Título */}
          <h1
            className="rise font-display max-w-[24ch] text-[length:var(--t-h1)] font-semibold leading-[1.06] text-ink"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            {post.title}
          </h1>

          {/* Linha de apoio */}
          {post.excerpt ? (
            <p
              className="rise mt-[var(--s-5)] max-w-[52ch] text-[length:var(--t-lead)] leading-[var(--lh-lead)] text-ink-2"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              {post.excerpt}
            </p>
          ) : null}

          {/* Autor e dados */}
          <div
            className="rise mt-[var(--s-7)] flex flex-wrap items-center gap-x-[var(--s-4)] gap-y-[var(--s-3)] border-t border-line pt-[var(--s-5)]"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            {post.author.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={post.author.image}
                alt=""
                width={36}
                height={36}
                className="rounded-full border border-line"
              />
            ) : (
              <span
                aria-hidden
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-[length:var(--t-meta)] font-medium text-ink-3"
                style={{ background: "var(--panel)" }}
              >
                {(post.author.name ?? "R")[0]?.toUpperCase()}
              </span>
            )}

            <div className="mr-auto">
              <p className="text-[length:var(--t-ui)] font-medium text-ink">
                {post.author.name ?? "Redacao"}
              </p>
              <time
                dateTime={isoDate(post.publishedAt)}
                className="text-[length:var(--t-meta)] text-ink-3"
              >
                {formatFullDate(post.publishedAt)}
              </time>
            </div>

            <span className="mono tnum text-[length:var(--t-meta)] text-ink-3">
              {minutes} min de leitura
            </span>
            <span aria-hidden className="text-ink-3">
              ·
            </span>
            <span className="mono tnum text-[length:var(--t-meta)] text-ink-3">
              {formatCount(post.views)} leituras
            </span>
          </div>
        </header>

        {/* ===== Capa ===== */}
        {post.coverImage ? (
          <div
            className="rise mx-auto px-[var(--gutter)] pb-[var(--s-8)]"
            style={{ maxWidth: "var(--page)", "--i": 5 } as React.CSSProperties}
          >
            <div
              className="overflow-hidden"
              style={{
                borderRadius: "var(--r-lg)",
                border: "1px solid var(--line)",
                aspectRatio: "16 / 9",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        {/* ===== Corpo ===== */}
        <div
          className="fade-in mx-auto px-[var(--gutter)] pb-[var(--s-9)]"
          style={{ "--i": 6 } as React.CSSProperties}
        >
          <div className="article mx-auto" style={{ maxWidth: "var(--measure)" }}>
            <MDXRemote source={post.content} />
          </div>
        </div>

        {/* ===== Fim do artigo ===== */}
        <div
          className="mx-auto px-[var(--gutter)]"
          style={{ maxWidth: "var(--measure)" }}
        >
          <div
            aria-hidden
            className="flex items-center justify-center gap-[var(--s-3)] pb-[var(--s-8)]"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--ink-3)",
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        </div>
      </article>

      {/* ===== Comentários ===== */}
      <Comments postId={post.id} comments={comments} />

      {/* ===== Artigos relacionados ===== */}
      {related.length > 0 ? (
        <section
          className="mx-auto px-[var(--gutter)] pb-[var(--s-9)]"
          style={{ maxWidth: "var(--page)" }}
        >
          <h2 className="label mb-[var(--s-5)]">Continue lendo</h2>
          <div style={{ borderBottom: "1px solid var(--line)" }}>
            {related.map((item, i) => (
              <PostRow
                key={item.id}
                index={i}
                title={item.title}
                slug={item.slug}
                excerpt={item.excerpt}
                content={item.content}
                publishedAt={item.publishedAt}
                tags={item.tags}
              />
            ))}
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </>
  );
}
