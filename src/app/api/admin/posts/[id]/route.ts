import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        tags: { include: { tag: true } },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se é o autor
    if (post.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Você não pode acessar este post' },
        { status: 403 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar post' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, content, excerpt, status, publishedAt } = body;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se é o autor
    if (post.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Você não pode editar este post' },
        { status: 403 }
      );
    }

    // Verificar se novo slug já existe
    if (slug && slug !== post.slug) {
      const existing = await prisma.post.findUnique({
        where: { slug },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Slug já está em uso' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (content) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (status) updateData.status = status;

    // Se mudou para PUBLISHED e não tem publishedAt, adiciona agora
    if (status === 'PUBLISHED' && !post.publishedAt && !publishedAt) {
      updateData.publishedAt = new Date();
    } else if (publishedAt) {
      updateData.publishedAt = new Date(publishedAt);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar post' },
      { status: 500 }
    );
  }
}
