import { createComment } from '@/lib/comments';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, name, email, content } = body;

    // Validação básica
    if (!postId || !name || !email || !content) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    if (content.length < 10) {
      return NextResponse.json(
        { error: 'Comentário deve ter pelo menos 10 caracteres' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Comentário não pode ter mais de 5000 caracteres' },
        { status: 400 }
      );
    }

    // Se usuário está logado, associar ao seu usuário
    const session = await auth();
    const authorId = session?.user?.id;

    const comment = await createComment({
      postId,
      name,
      email,
      content,
      authorId,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar comentário' },
      { status: 500 }
    );
  }
}
