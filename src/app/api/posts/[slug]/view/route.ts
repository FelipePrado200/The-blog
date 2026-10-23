import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { incrementPostViews } from "@/lib/posts";

/*
  Soma uma visita ao artigo.
  Fica fora do render porque a página do artigo e estática.
*/
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false }, { status: 204 });
  }

  try {
    const { slug } = await params;

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });

    if (!post || post.status !== "PUBLISHED") {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await incrementPostViews(post.id);
    return NextResponse.json({ ok: true });
  } catch {
    // Nunca devolve erro para o leitor por causa de uma contagem.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
