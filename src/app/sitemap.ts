import type { MetadataRoute } from "next";
import { getPublishedPosts, getAllTags } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_BLOG_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ posts }, tags] = await Promise.all([
    getPublishedPosts(200, 0),
    getAllTags(),
  ]);

  const fixed: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/tags`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const articles: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: post.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const themes: MetadataRoute.Sitemap = tags
    .filter((tag) => tag.count > 0)
    .map((tag) => ({
      url: `${SITE_URL}/tags/${tag.slug}`,
      changeFrequency: "weekly",
      priority: 0.3,
    }));

  return [...fixed, ...articles, ...themes];
}
