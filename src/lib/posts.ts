import { prisma } from "./prisma";
import { Post, PostStatus } from "@prisma/client";

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { name: true, email: true, image: true },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function getPublishedPosts(limit?: number, offset?: number) {
  const where = { status: "PUBLISHED" as PostStatus };
  const take = limit ?? 10;
  const skip = offset ?? 0;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: { name: true, email: true, image: true },
        },
        tags: {
          include: {
            tag: {
              select: { name: true, slug: true },
            },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      take,
      skip,
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total, pages: Math.ceil(total / take) };
}

export async function getPostsByTag(tagSlug: string) {
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      tags: {
        some: {
          tag: { slug: tagSlug },
        },
      },
    },
    include: {
      author: {
        select: { name: true, email: true, image: true },
      },
      tags: {
        include: {
          tag: {
            select: { name: true, slug: true },
          },
        },
      },
    },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getAllTags() {
  return prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
}

export async function createPost(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: string;
}) {
  return prisma.post.create({
    data,
  });
}

export async function updatePost(
  postId: string,
  data: Partial<Post>
) {
  return prisma.post.update({
    where: { id: postId },
    data,
    include: {
      author: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function publishPost(postId: string) {
  return prisma.post.update({
    where: { id: postId },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
}

export async function incrementPostViews(postId: string) {
  return prisma.post.update({
    where: { id: postId },
    data: { views: { increment: 1 } },
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
