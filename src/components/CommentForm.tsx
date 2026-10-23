'use client';

import { FormEvent, useState } from 'react';

interface CommentFormProps {
  postId: string;
  onSuccess?: () => void;
}

export function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          name: formData.get('name'),
          email: formData.get('email'),
          content: formData.get('content'),
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar comentário');
      }

      setSuccess(true);
      e.currentTarget.reset();
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Comentário enviado com sucesso! Aguardando moderação.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Seu nome"
          required
          className="px-4 py-2 border border-[#E6E5E1] rounded-[8px] text-[#16161A] placeholder-[#8A8A90] focus:outline-none focus:ring-2 focus:ring-[#4B3FBE]"
        />
        <input
          type="email"
          name="email"
          placeholder="seu@email.com"
          required
          className="px-4 py-2 border border-[#E6E5E1] rounded-[8px] text-[#16161A] placeholder-[#8A8A90] focus:outline-none focus:ring-2 focus:ring-[#4B3FBE]"
        />
      </div>

      <textarea
        name="content"
        placeholder="Seu comentário..."
        rows={5}
        required
        className="w-full px-4 py-3 border border-[#E6E5E1] rounded-[8px] text-[#16161A] placeholder-[#8A8A90] focus:outline-none focus:ring-2 focus:ring-[#4B3FBE] resize-none"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-[#4B3FBE] text-white font-medium rounded-[8px] hover:bg-[#3d328a] disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Enviando...' : 'Comentar'}
        </button>
      </div>

      <p className="text-xs text-[#8A8A90]">
        Seu comentário será revisado antes de ser publicado.
      </p>
    </form>
  );
}
