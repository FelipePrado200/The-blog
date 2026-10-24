import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PostRow } from "@/components/PostRow";
import { getPostsByTag, getTagBySlug, getAllTags } from "@/lib/posts";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Tag não encontrada" };

  return {
    title: tag.name,
    description: `Artigos sobre ${tag.name}.`,
  };
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ slug: tag.slug }));
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  const [tag, posts] = await Promise.all([
    getTagBySlug(slug),
    getPostsByTag(slug),
  ]);

  if (!tag) notFound();

  return (
    <>
      <SiteHeader />

      <main
        className="mx-auto min-h-[60vh] px-[var(--gutter)] pt-[var(--s-8)] pb-[var(--s-9)]"
        style={{ maxWidth: "var(--page)" }}
      >
        <nav className="rise mb-[var(--s-6)]" style={{ "--i": 0 } as React.CSSProperties}>
          <Link
            href="/tags"
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
            Todas as tags
          </Link>
        </nav>

        <p className="rise label" style={{ "--i": 1 } as React.CSSProperties}>
          Tag
        </p>
        <h1
          className="rise font-display mt-[var(--s-4)] text-[length:var(--t-h1)] font-semibold leading-[1.08] text-ink"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          {tag.name}
        </h1>
        <p
          className="rise mono tnum mt-[var(--s-5)] text-[length:var(--t-meta)] text-ink-3"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          {posts.length} {posts.length === 1 ? "artigo" : "artigos"}
        </p>

        {posts.length === 0 ? (
          <p className="mt-[var(--s-8)] text-[length:var(--t-ui)] text-ink-3">
            Nenhum artigo publicado com esta tag.
          </p>
        ) : (
          <div
            className="mt-[var(--s-8)]"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            {posts.map((post, i) => (
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
        )}
      </main>

      <SiteFooter />
    </>
  );
}
