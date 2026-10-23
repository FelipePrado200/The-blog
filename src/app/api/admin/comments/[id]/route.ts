import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['APPROVED', 'REJECTED', 'SPAM', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    // Verificar se o comentário pertence a um post do usuário
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: { authorId: true },
        },
      },
    });

    if (!comment || comment.post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar comentário' },
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

    // Verificar se o comentário pertence a um post do usuário
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: { authorId: true },
        },
      },
    });

    if (!comment || comment.post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      );
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar comentário' },
      { status: 500 }
    );
  }
}
