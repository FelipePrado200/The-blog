import { prisma } from "./prisma";
import type { Post, PostStatus } from "@prisma/client";

/* Formato que a home e as listas usam. */
export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  views: number;
  author: { name: string | null; image: string | null };
  tags: Array<{ tag: { name: string; slug: string } }>;
};

export type TagWithCount = { name: string; slug: string; count: number };

const LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  content: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  views: true,
  author: { select: { name: true, image: true } },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} as const;

/*
  O banco pode não estar configurado quando alguém clona o projeto.
  Nesse caso a página mostra o estado vazio em vez de quebrar.
*/
function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function getHomeData(limit = 12): Promise<{
  posts: PostListItem[];
  tags: TagWithCount[];
  total: number;
  dbReady: boolean;
}> {
  if (!dbConfigured()) {
    return { posts: [], tags: [], total: 0, dbReady: false };
  }

  try {
    const [posts, total, tags] = await Promise.all([
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: LIST_SELECT,
        orderBy: { publishedAt: "desc" },
        take: limit,
      }),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.tag.findMany({
        select: {
          name: true,
          slug: true,
          _count: { select: { posts: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      posts,
      total,
      dbReady: true,
      tags: tags
        .map((t) => ({ name: t.name, slug: t.slug, count: t._count.posts }))
        .filter((t) => t.count > 0),
    };
  } catch (error) {
    console.error("[posts] A consulta da home falhou:", error);
    return { posts: [], tags: [], total: 0, dbReady: false };
  }
}

export async function getPostBySlug(slug: string) {
  if (!dbConfigured()) return null;

  try {
    return await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, email: true, image: true } },
        tags: { include: { tag: true } },
      },
    });
  } catch (error) {
    console.error("[posts] Não foi possível carregar o post:", error);
    return null;
  }
}

/** Posts publicados, com páginação. */
export async function getPublishedPosts(limit = 10, offset = 0) {
  if (!dbConfigured()) {
    return { posts: [] as PostListItem[], total: 0, pages: 0 };
  }

  try {
    const where = { status: "PUBLISHED" as PostStatus };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: LIST_SELECT,
        orderBy: { publishedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.post.count({ where }),
    ]);

    return { posts, total, pages: Math.ceil(total / limit) };
  } catch (error) {
    console.error("[posts] A listagem falhou:", error);
    return { posts: [] as PostListItem[], total: 0, pages: 0 };
  }
}

export async function getPostsByTag(tagSlug: string) {
  if (!dbConfigured()) return [] as PostListItem[];

  try {
    return await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        tags: { some: { tag: { slug: tagSlug } } },
      },
      select: LIST_SELECT,
      orderBy: { publishedAt: "desc" },
    });
  } catch (error) {
    console.error("[posts] A busca por tag falhou:", error);
    return [] as PostListItem[];
  }
}

export async function getTagBySlug(slug: string) {
  if (!dbConfigured()) return null;
  try {
    return await prisma.tag.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function getAllTags(): Promise<TagWithCount[]> {
  if (!dbConfigured()) return [];

  try {
    const tags = await prisma.tag.findMany({
      select: { name: true, slug: true, _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    });
    return tags.map((t) => ({
      name: t.name,
      slug: t.slug,
      count: t._count.posts,
    }));
  } catch (error) {
    console.error("[posts] A listagem de tags falhou:", error);
    return [];
  }
}

/** Posts que dividem ao menos uma tag com o post atual. */
export async function getRelatedPosts(
  postId: string,
  tagSlugs: string[],
  limit = 3
): Promise<PostListItem[]> {
  if (!dbConfigured() || tagSlugs.length === 0) return [];

  try {
    return await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: postId },
        tags: { some: { tag: { slug: { in: tagSlugs } } } },
      },
      select: LIST_SELECT,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function createPost(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: string;
}) {
  return prisma.post.create({ data });
}

export async function updatePost(postId: string, data: Partial<Post>) {
  return prisma.post.update({
    where: { id: postId },
    data,
    include: { author: true, tags: { include: { tag: true } } },
  });
}

export async function publishPost(postId: string) {
  return prisma.post.update({
    where: { id: postId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
}

/*
  Soma uma visita. Nunca deixa a contagem derrubar a página:
  se a escrita falhar, o artigo continua aparecendo.
*/
export async function incrementPostViews(postId: string): Promise<void> {
  try {
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    console.error("[posts] Não foi possível somar a visita:", error);
  }
}

/** Texto para slug: sem acento, sem símbolo, com hífen. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
