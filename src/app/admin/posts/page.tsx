import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

const STATUS_LABELS = {
  DRAFT: { label: 'Rascunho', color: '#4A4A52', bg: '#F1F0EC' },
  SCHEDULED: { label: 'Agendado', color: '#413593', bg: '#EDEBFA' },
  PUBLISHED: { label: 'Publicado', color: '#175F42', bg: '#E7F4EE' },
};

export const metadata = {
  title: 'Posts | Painel Administrativo',
};

export default async function AdminPostsPage() {
  const session = await auth();

  const posts = await prisma.post.findMany({
    where: {
      authorId: session?.user?.id,
    },
    include: {
      author: true,
      tags: { include: { tag: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[#E6E5E1] bg-white p-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#16161A]">Posts</h1>
            <p className="text-[#55555C] mt-2">{posts.length} artigos no total</p>
          </div>
          <Link
            href="/admin/editor"
            className="bg-[#4B3FBE] text-white font-medium px-6 py-3 rounded-[10px] hover:bg-[#3d328a] transition-colors"
          >
            + Novo post
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[12px] border border-[#E6E5E1]">
              <p className="text-[#8A8A90] mb-4">Nenhum post criado ainda.</p>
              <Link
                href="/admin/editor"
                className="text-[#4B3FBE] hover:underline font-medium"
              >
                Criar o primeiro post
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[12px] border border-[#E6E5E1] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E6E5E1] bg-[#F7F7F5]">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#16161A]">
                      Título
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#16161A]">
                      Situação
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#16161A]">
                      Data
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#16161A]">
                      Visualizações
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#16161A]">
                      Comentários
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#16161A]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const statusInfo =
                      STATUS_LABELS[post.status as keyof typeof STATUS_LABELS];
                    const displayDate =
                      post.status === 'PUBLISHED' && post.publishedAt
                        ? format(post.publishedAt, 'd MMM yyyy', { locale: ptBR })
                        : format(post.updatedAt, 'd MMM yyyy', { locale: ptBR });

                    return (
                      <tr
                        key={post.id}
                        className="border-b border-[#E6E5E1] hover:bg-[#F7F7F5] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-[#16161A]">{post.title}</p>
                            <p className="text-xs text-[#8A8A90]">
                              {post.slug}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            style={{
                              color: statusInfo.color,
                              backgroundColor: statusInfo.bg,
                            }}
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#55555C]">
                          {displayDate}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#55555C]">
                          {post.views}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#55555C]">
                          {post._count.comments}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/editor?id=${post.id}`}
                              className="text-[#4B3FBE] hover:text-[#3d328a] font-medium text-sm"
                            >
                              Editar
                            </Link>
                            <a
                              href={`/posts/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#8A8A90] hover:text-[#4B3FBE] font-medium text-sm"
                            >
                              Ver
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
