import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CommentStatus, Prisma } from "@prisma/client";

const VALID: CommentStatus[] = ["PENDING", "APPROVED", "REJECTED", "SPAM"];

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const status = request.nextUrl.searchParams.get("status");

    // Cada pessoa modera apenas os comentários dos próprios artigos.
    const scope: Prisma.CommentWhereInput = {
      post: { authorId: session.user.id },
    };

    const where: Prisma.CommentWhereInput = { ...scope };
    if (status && VALID.includes(status as CommentStatus)) {
      where.status = status as CommentStatus;
    }

    const [comments, grouped] = await Promise.all([
      prisma.comment.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          content: true,
          status: true,
          createdAt: true,
          post: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.comment.groupBy({
        by: ["status"],
        where: scope,
        _count: { _all: true },
      }),
    ]);

    const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0, SPAM: 0 };
    for (const row of grouped) {
      counts[row.status] = row._count._all;
    }

    return NextResponse.json({ comments, counts });
  } catch (error) {
    console.error("[api] A listagem de comentários falhou:", error);
    return NextResponse.json(
      { error: "Erro ao buscar comentários" },
      { status: 500 }
    );
  }
}
