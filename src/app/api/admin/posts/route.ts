import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, slug, content, excerpt, status } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Verificar se slug já existe
    const existing = await prisma.post.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug já está em uso' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        status: status || 'DRAFT',
        authorId: session.user.id,
      },
      include: {
        author: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return NextResponse.json(
      { error: 'Erro ao criar post' },
      { status: 500 }
    );
  }
}
