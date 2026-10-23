import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/posts";
import { replacePostTags } from "@/lib/tags";
import type { Prisma } from "@prisma/client";

const STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED"] as const;

/** Confere que a pessoa pode mexer neste post. */
async function authorize(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Não autorizado", status: 403 as const };
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true, slug: true, publishedAt: true },
  });

  if (!post) return { error: "Post não encontrado", status: 404 as const };
  if (post.authorId !== session.user.id) {
    return { error: "Este post e de outra pessoa", status: 403 as const };
  }

  return { post };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const check = await authorize(id);
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, image: true } },
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(post);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const check = await authorize(id);
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const current = check.post;
    const body = await request.json();
    const data: Prisma.PostUpdateInput = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json(
          { error: "O título não pode ficar vazio." },
          { status: 400 }
        );
      }
      data.title = title;
    }

    if (typeof body.slug === "string") {
      const slug = slugify(body.slug);
      if (slug && slug !== current.slug) {
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
        data.slug = slug;
      }
    }

    if (typeof body.content === "string") data.content = body.content;

    if ("excerpt" in body) {
      data.excerpt = body.excerpt ? String(body.excerpt).trim() : null;
    }
    if ("coverImage" in body) {
      data.coverImage = body.coverImage ? String(body.coverImage).trim() : null;
    }

    if (STATUSES.includes(body.status)) {
      data.status = body.status;
      // Guarda a data da primeira publicação e não mexe nela depois.
      if (body.status === "PUBLISHED" && !current.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    if (body.publishedAt) {
      const when = new Date(body.publishedAt);
      if (!Number.isNaN(when.getTime())) data.publishedAt = when;
    }

    if ("tags" in body) {
      await replacePostTags(id, body.tags);
    }

    const post = await prisma.post.update({
      where: { id },
      data,
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[api] Não foi possível atualizar o post:", error);
    return NextResponse.json(
      { error: "Erro ao salvar o post." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const check = await authorize(id);
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api] Não foi possível excluir o post:", error);
    return NextResponse.json(
      { error: "Erro ao excluir o post." },
      { status: 500 }
    );
  }
}
