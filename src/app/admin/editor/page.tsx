'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  publishedAt?: string;
  tags?: Array<{ tag: { name: string; slug: string } }>;
}

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'PUBLISHED', label: 'Publicado' },
];

export default function EditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postId = searchParams.get('id');

  const [post, setPost] = useState<PostData>({
    id: '',
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'DRAFT',
  });

  const [isLoading, setIsLoading] = useState(!!postId);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  async function loadPost() {
    try {
      const response = await fetch(`/api/admin/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error('Erro ao carregar post:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(asDraft = true) {
    setIsSaving(true);
    try {
      const url = postId ? `/api/admin/posts/${postId}` : '/api/admin/posts';
      const method = postId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...post,
          status: asDraft ? 'DRAFT' : post.status,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
        setLastSaved(new Date());

        if (!postId) {
          router.push(`/admin/editor?id=${data.id}`);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar post:', error);
    } finally {
      setIsSaving(false);
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 border-b border-[#E6E5E1] bg-white px-8 py-4 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#16161A]">
              {postId ? 'Editar Post' : 'Novo Post'}
            </h1>
            {lastSaved && (
              <p className="text-xs text-[#8A8A90] mt-1">
                Último salvo: {format(lastSaved, 'HH:mm', { locale: ptBR })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={post.status}
              onChange={(e) =>
                setPost({ ...post, status: e.target.value as any })
              }
              className="px-3 py-2 border border-[#E6E5E1] rounded-[8px] text-sm font-medium text-[#16161A] bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-6 py-2 bg-[#F7F7F5] text-[#16161A] font-medium rounded-[8px] hover:bg-[#EDECE8] disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Salvando...' : 'Salvar rascunho'}
            </button>

            {post.status === 'DRAFT' && (
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-6 py-2 bg-[#4B3FBE] text-white font-medium rounded-[8px] hover:bg-[#3d328a] disabled:opacity-50 transition-colors"
              >
                Publicar
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-[#8A8A90]">
          Carregando...
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-8 space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#16161A] mb-2">
                Título
              </label>
              <input
                type="text"
                value={post.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setPost({
                    ...post,
                    title,
                    slug: generateSlug(title) || post.slug,
                  });
                }}
                placeholder="Título do artigo..."
                className="w-full px-4 py-3 border border-[#E6E5E1] rounded-[10px] text-lg font-serif font-bold text-[#16161A] placeholder-[#8A8A90] focus:outline-none focus:ring-2 focus:ring-[#4B3FBE]"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-[#16161A] mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={post.slug}
                onChange={(e) => setPost({ ...post, slug: e.target.value })}
                className="w-full px-4 py-2 border border-[#E6E5E1] rounded-[8px] text-sm font-mono text-[#16161A] placeholder-[#8A8A90] focus:outline-none focus:ring-2 focus:ring-[#4B3FBE]"
              />
              <p className="text-xs text-[#8A8A90] mt-2">
                /posts/{post.slug}
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-[#16161A] mb-2">
                Resumo (opcional)
              </label>
              <textarea
                value={post.excerpt || ''}
                onChange={(e) =>
                  setPost({ ...post, excerpt: e.target.value })
                }
                placeholder="Um breve resumo do artigo..."
                rows={2}
                className="w-full px-4 py-2 border border-[#E6E5E1] rounded-[8px] text-sm text-[#16161A] placeholder-[#8A8A90] focus:outline-none focus:ring-2 focus:ring-[#4B3FBE] resize-none"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-[#16161A] mb-2">
                Conteúdo (Markdown/MDX)
              </label>
              <textarea
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
                placeholder="# Título do artigo

Escreva o conteúdo em Markdown..."
                rows={20}
                className="w-full px-4 py-3 border border-[#E6E5E1] rounded-[8px] text-sm font-mono text-[#16161A] placeholder-[#8A8A90] focus:outline-none focus:ring-2 focus:ring-[#4B3FBE] resize-none"
              />
              <p className="text-xs text-[#8A8A90] mt-2">
                Markdown e JSX (MDX) são suportados.
              </p>
            </div>

            {/* Help Text */}
            <div className="bg-[#F7F7F5] rounded-[10px] p-6 space-y-3">
              <h3 className="font-semibold text-[#16161A]">💡 Dicas</h3>
              <ul className="text-sm text-[#55555C] space-y-2">
                <li>• Use `# `, `## `, `### ` para títulos</li>
                <li>• Use `**texto**` para negrito</li>
                <li>
                  • Use ` ```js código ``` ` para blocos de código
                </li>
                <li>• O slug é gerado automaticamente a partir do título</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
