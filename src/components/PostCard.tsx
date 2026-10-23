'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PostCardProps {
  title: string;
  excerpt?: string;
  slug: string;
  publishedAt: Date;
  author: {
    name: string | null;
  };
  tags?: Array<{ tag: { name: string; slug: string } }>;
  views: number;
}

export function PostCard({
  title,
  excerpt,
  slug,
  publishedAt,
  author,
  tags,
  views,
}: PostCardProps) {
  const formattedDate = format(publishedAt, 'dd MMM yyyy', { locale: ptBR });

  return (
    <article className="group relative">
      <Link href={`/posts/${slug}`}>
        <a className="block">
          <div className="space-y-3 transition-all duration-300 group-hover:translate-y-[-2px]">
            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 3).map(({ tag }) => (
                  <span
                    key={tag.slug}
                    className="text-xs font-medium text-[#55555C] bg-[#F7F7F5] px-2.5 py-1 rounded-[6px]"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h2 className="text-2xl font-serif font-bold text-[#16161A] line-clamp-2 group-hover:text-[#4B3FBE] transition-colors">
              {title}
            </h2>

            {/* Excerpt */}
            {excerpt && (
              <p className="text-base text-[#55555C] line-clamp-2 leading-relaxed">
                {excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-[#8A8A90] pt-2">
              <span>{author.name || 'Anônimo'}</span>
              <span>{formattedDate}</span>
              <span>{views} visualizações</span>
            </div>
          </div>
        </a>
      </Link>

      {/* Divider */}
      <div className="h-px bg-[#E6E5E1] mt-6" />
    </article>
  );
}
