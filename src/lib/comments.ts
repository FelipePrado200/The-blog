import { prisma } from "./prisma";
import type { CommentStatus } from "@prisma/client";

function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/*
  Comentários aprovados de um artigo.
  O e-mail nunca sai daqui: ele serve para avisar a pessoa,
  e não deve aparecer na página pública.
*/
export async function getApprovedComments(postId: string) {
  if (!dbConfigured()) return [];

  try {
    return await prisma.comment.findMany({
      where: { postId, status: "APPROVED" },
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true,
        author: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[comments] Não foi possível carregar:", error);
    return [];
  }
}

export async function createComment(data: {
  postId: string;
  name: string;
  email: string;
  content: string;
  authorId?: string;
}) {
  return prisma.comment.create({
    data: { ...data, status: "PENDING" as CommentStatus },
  });
}

/** Quantos comentários esperam revisão. Alimenta o aviso no painel. */
export async function countPendingComments(authorId: string): Promise<number> {
  if (!dbConfigured()) return 0;

  try {
    return await prisma.comment.count({
      where: { status: "PENDING", post: { authorId } },
    });
  } catch {
    return 0;
  }
}

export async function getPendingComments() {
  if (!dbConfigured()) return [];

  try {
    return await prisma.comment.findMany({
      where: { status: "PENDING" },
      include: { post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return [];
  }
}

export async function approveComment(commentId: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { status: "APPROVED" },
  });
}

export async function rejectComment(commentId: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { status: "REJECTED" },
  });
}

export async function markAsSpam(commentId: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { status: "SPAM" },
  });
}

export async function deleteComment(commentId: string) {
  return prisma.comment.delete({ where: { id: commentId } });
}
