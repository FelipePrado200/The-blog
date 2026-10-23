'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  post: {
    title: string;
    slug: string;
  };
}

const STATUS_COLORS = {
  PENDING: { label: 'Pendente', color: '#413593', bg: '#EDEBFA' },
  APPROVED: { label: 'Aprovado', color: '#175F42', bg: '#E7F4EE' },
  REJECTED: { label: 'Rejeitado', color: '#8A3D2C', bg: '#F8E9E1' },
  SPAM: { label: 'Spam', color: '#8B3A3A', bg: '#FDEBEB' },
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');

  useEffect(() => {
    loadComments();
  }, [filter]);

  async function loadComments() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/comments?status=${filter === 'PENDING' ? 'PENDING' : ''}`
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateCommentStatus(
    commentId: string,
    newStatus: 'APPROVED' | 'REJECTED' | 'SPAM'
  ) {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      }
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
    }
  }

  const pendingCount = comments.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[#E6E5E1] bg-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-[#16161A]">
            Comentários
          </h1>
          {pendingCount > 0 && (
            <p className="text-[#4B3FBE] mt-2 font-medium">
              {pendingCount} comentário{pendingCount !== 1 ? 's' : ''} aguardando
              moderação
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-[#E6E5E1] bg-[#F7F7F5] px-8 py-4">
        <div className="max-w-6xl mx-auto flex gap-3">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'PENDING'
                ? 'bg-white text-[#4B3FBE] border border-[#4B3FBE]'
                : 'text-[#55555C] hover:bg-white'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'ALL'
                ? 'bg-white text-[#4B3FBE] border border-[#4B3FBE]'
                : 'text-[#55555C] hover:bg-white'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-[#8A8A90]">
              Carregando comentários...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-[#8A8A90]">
              {filter === 'PENDING'
                ? 'Nenhum comentário pendente. Tudo está em dia!'
                : 'Nenhum comentário encontrado.'}
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white border border-[#E6E5E1] rounded-[12px] p-6 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-[#16161A]">
                        {comment.name}
                      </h3>
                      <span className="text-xs text-[#8A8A90]">
                        {comment.email}
                      </span>
                    </div>
                    <p className="text-sm text-[#55555C] mt-1">
                      em{' '}
                      <a
                        href={`/posts/${comment.post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4B3FBE] hover:underline"
                      >
                        {comment.post.title}
                      </a>
                    </p>
                    <p className="text-xs text-[#8A8A90] mt-1">
                      {format(new Date(comment.createdAt), 'd MMM yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div>
                    {STATUS_COLORS[comment.status] && (
                      <span
                        style={{
                          color: STATUS_COLORS[comment.status].color,
                          backgroundColor: STATUS_COLORS[comment.status].bg,
                        }}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      >
                        {STATUS_COLORS[comment.status].label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="bg-[#F7F7F5] rounded-[8px] p-4">
                  <p className="text-[#16161A] leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>

                {/* Actions */}
                {comment.status === 'PENDING' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() =>
                        updateCommentStatus(comment.id, 'APPROVED')
                      }
                      className="px-4 py-2 bg-[#175F42] text-white text-sm font-medium rounded-[8px] hover:bg-[#134a33] transition-colors"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() =>
                        updateCommentStatus(comment.id, 'REJECTED')
                      }
                      className="px-4 py-2 bg-[#8A3D2C] text-white text-sm font-medium rounded-[8px] hover:bg-[#6d3120] transition-colors"
                    >
                      Rejeitar
                    </button>
                    <button
                      onClick={() => updateCommentStatus(comment.id, 'SPAM')}
                      className="px-4 py-2 bg-[#8B3A3A] text-white text-sm font-medium rounded-[8px] hover:bg-[#6d2f2f] transition-colors"
                    >
                      Spam
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
