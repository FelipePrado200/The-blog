'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReactNode } from 'react';

interface PostProps {
  title: string;
  author: {
    name: string | null;
    image: string | null;
  };
  publishedAt: Date;
  tags?: Array<{ tag: { name: string; slug: string } }>;
  views: number;
  children: ReactNode; // MDX rendered content
}

export function Post({
  title,
  author,
  publishedAt,
  tags,
  views,
  children,
}: PostProps) {
  const formattedDate = format(publishedAt, 'd MMMM yyyy', { locale: ptBR });

  return (
    <article className="max-w-[68ch] mx-auto space-y-8 px-4 py-12">
      {/* Header */}
      <header className="space-y-6 border-b border-[#E6E5E1] pb-8">
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag }) => (
              <a
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className="text-xs font-medium text-[#55555C] bg-[#F7F7F5] hover:bg-[#EDECE8] px-2.5 py-1 rounded-[6px] transition-colors"
              >
                {tag.name}
              </a>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl font-serif font-bold text-[#16161A] leading-tight">
          {title}
        </h1>

        {/* Metadata */}
        <div className="flex items-center gap-6 text-sm text-[#55555C]">
          <div className="flex items-center gap-3">
            {author.image && (
              <img
                src={author.image}
                alt={author.name || 'Autor'}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="font-medium">{author.name || 'Anônimo'}</span>
          </div>
          <time>{formattedDate}</time>
          <span>{views} visualizações</span>
        </div>
      </header>

      {/* Content - typography for MDX */}
      <div className="prose prose-lg max-w-none dark:prose-invert
        prose-headings:font-serif prose-headings:text-[#16161A]
        prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-base prose-p:text-[#55555C] prose-p:leading-relaxed prose-p:my-4
        prose-a:text-[#4B3FBE] prose-a:no-underline hover:prose-a:underline
        prose-strong:font-bold prose-strong:text-[#16161A]
        prose-em:italic prose-em:text-[#55555C]
        prose-code:bg-[#F7F7F5] prose-code:text-[#16161A] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-[#0D0D10] prose-pre:text-[#EDEDF0] prose-pre:overflow-x-auto
        prose-blockquote:border-l-4 prose-blockquote:border-[#4B3FBE] prose-blockquote:pl-4 prose-blockquote:italic
        prose-hr:border-[#E6E5E1]
        prose-img:rounded-lg prose-img:my-8
        prose-ul:list-disc prose-ul:pl-5
        prose-ol:list-decimal prose-ol:pl-5
        prose-li:text-[#55555C] prose-li:my-1
      ">
        {children}
      </div>
    </article>
  );
}
