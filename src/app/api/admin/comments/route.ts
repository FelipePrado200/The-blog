import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where: any = {
      post: {
        authorId: session.user.id,
      },
    };

    if (status && status !== '') {
      where.status = status;
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        post: {
          select: { title: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar comentários' },
      { status: 500 }
    );
  }
}
