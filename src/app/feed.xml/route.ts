import { getPublishedPosts } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_BLOG_URL ?? "http://localhost:3000";
const TITLE = process.env.NEXT_PUBLIC_BLOG_TITLE ?? "The Blog";
const DESCRIPTION =
  process.env.NEXT_PUBLIC_BLOG_DESCRIPTION ??
  "Notas sobre engenharia de front-end, interface e as decisões que ficam de fora da documentação.";

export const revalidate = 600;

/** Escapa os cinco caracteres que XML não aceita em texto. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { posts } = await getPublishedPosts(50, 0);

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/posts/${post.slug}`;
      const summary =
        post.excerpt ??
        post.content.replace(/```[\s\S]*?```/g, " ").slice(0, 280);

      return [
        "    <item>",
        `      <title>${xml(post.title)}</title>`,
        `      <link>${xml(url)}</link>`,
        `      <guid isPermaLink="true">${xml(url)}</guid>`,
        post.publishedAt
          ? `      <pubDate>${post.publishedAt.toUTCString()}</pubDate>`
          : "",
        `      <description>${xml(summary)}</description>`,
        post.author.name ? `      <author>${xml(post.author.name)}</author>` : "",
        ...post.tags.map(
          ({ tag }) => `      <category>${xml(tag.name)}</category>`
        ),
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(TITLE)}</title>
    <link>${xml(SITE_URL)}</link>
    <description>${xml(DESCRIPTION)}</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${xml(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=1200",
    },
  });
}
