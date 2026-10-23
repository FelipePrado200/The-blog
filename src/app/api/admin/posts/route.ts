import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/posts";
import { connectTags } from "@/lib/tags";

const STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED"] as const;
type Status = (typeof STATUSES)[number];

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "");
    const slug = slugify(String(body.slug ?? "") || title);

    if (!title) {
      return NextResponse.json(
        { error: "O título é obrigatório." },
        { status: 400 }
      );
    }
    if (!slug) {
      return NextResponse.json(
        { error: "Não foi possível montar o endereço a partir do título." },
        { status: 400 }
      );
    }

    const taken = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json(
        { error: "Já existe um post com este endereço." },
        { status: 409 }
      );
    }

    const status: Status = STATUSES.includes(body.status)
      ? body.status
      : "DRAFT";

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: body.excerpt ? String(body.excerpt).trim() : null,
        coverImage: body.coverImage ? String(body.coverImage).trim() : null,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: session.user.id,
        tags: { create: await connectTags(body.tags) },
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[api] Não foi possível criar o post:", error);
    return NextResponse.json(
      { error: "Erro ao criar o post." },
      { status: 500 }
    );
  }
}
