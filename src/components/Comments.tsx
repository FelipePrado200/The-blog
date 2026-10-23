'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { CommentForm } from './CommentForm';

interface CommentData {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: Date;
  author?: {
    name: string | null;
    image: string | null;
  } | null;
}

interface CommentsProps {
  postId: string;
  comments: CommentData[];
}

export function Comments({ postId, comments }: CommentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="max-w-[68ch] mx-auto border-t border-[#E6E5E1] py-12 px-4">
      <h2 className="text-2xl font-serif font-bold text-[#16161A] mb-8">
        Comentários ({comments.length})
      </h2>

      {/* List of approved comments */}
      {comments.length > 0 && (
        <div className="space-y-6 mb-12">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              {/* Avatar */}
              {comment.author?.image ? (
                <img
                  src={comment.author.image}
                  alt={comment.author.name || 'Autor'}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#E6E5E1] flex-shrink-0" />
              )}

              {/* Comment content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[#16161A]">
                    {comment.author?.name || comment.name}
                  </span>
                  <time className="text-sm text-[#8A8A90]">
                    {format(new Date(comment.createdAt), 'd MMM yyyy', { locale: ptBR })}
                  </time>
                </div>
                <p className="text-[#55555C] mt-2 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form toggle */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-[#4B3FBE] text-white font-medium rounded-[10px] hover:bg-[#3d328a] transition-colors"
        >
          Deixar um comentário
        </button>
      ) : (
        <CommentForm postId={postId} onSuccess={() => setIsOpen(false)} />
      )}
    </section>
  );
}
