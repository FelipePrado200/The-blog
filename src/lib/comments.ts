import { prisma } from "./prisma";
import { CommentStatus } from "@prisma/client";

export async function getApprovedComments(postId: string) {
  return prisma.comment.findMany({
    where: {
      postId,
      status: "APPROVED",
    },
    select: {
      id: true,
      name: true,
      email: true,
      content: true,
      createdAt: true,
      author: {
        select: { name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createComment(data: {
  postId: string;
  name: string;
  email: string;
  content: string;
  authorId?: string;
}) {
  return prisma.comment.create({
    data: {
      ...data,
      status: "PENDING" as CommentStatus,
    },
  });
}

export async function getPendingComments() {
  return prisma.comment.findMany({
    where: { status: "PENDING" },
    include: {
      post: {
        select: { title: true, slug: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
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
  return prisma.comment.delete({
    where: { id: commentId },
  });
}
