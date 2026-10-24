import Link from "next/link";
import { formatDayMonth, readingTime } from "@/lib/format";

interface PostRowProps {
  index: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  publishedAt: Date | null;
  tags?: Array<{ tag: { name: string; slug: string } }>;
}

/*
  Linha de indice, no estilo de sumário de revista.
  O número fica em mono, o título em serif, os dados em sans.
*/
export function PostRow({
  index,
  title,
  slug,
  excerpt,
  content,
  publishedAt,
  tags,
}: PostRowProps) {
  return (
    <article className="rise" style={{ "--i": index } as React.CSSProperties}>
      <Link
        href={`/posts/${slug}`}
        className="group block border-t border-line py-[var(--s-5)] transition-[border-color] duration-300 ease-[var(--ease-io)] hover:border-ink-3"
      >
        <div className="grid grid-cols-[2.5rem_1fr] gap-x-[var(--s-4)] sm:grid-cols-[3.5rem_1fr_auto] sm:gap-x-[var(--s-5)]">
          {/* Número */}
          <span className="mono tnum pt-[6px] text-[length:var(--t-meta)] text-ink-3 transition-colors duration-300 ease-[var(--ease-io)] group-hover:text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Título e resumo */}
          <div
            className="min-w-0"
            style={{ transition: "transform var(--dur-2) var(--ease)" }}
          >
            <h2 className="font-display text-[1.5rem] font-semibold leading-[1.2] text-ink sm:text-[1.75rem]">
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-[2px] transition-[background-size] duration-500 ease-[var(--ease)] group-hover:bg-[length:100%_1px]">
                {title}
              </span>
            </h2>

            {excerpt ? (
              <p className="mt-[var(--s-3)] max-w-[56ch] text-[length:var(--t-ui)] leading-[1.6] text-ink-2">
                {excerpt}
              </p>
            ) : null}

            {tags && tags.length > 0 ? (
              <ul className="mt-[var(--s-4)] flex flex-wrap gap-[var(--s-2)]">
                {tags.slice(0, 3).map(({ tag }) => (
                  <li
                    key={tag.slug}
                    className="label border border-line-soft px-[var(--s-2)] py-[3px]"
                    style={{ borderRadius: "var(--r-full)" }}
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Dados do artigo */}
          <div className="col-start-2 mt-[var(--s-4)] flex items-center gap-[var(--s-3)] sm:col-start-3 sm:mt-[6px] sm:flex-col sm:items-end sm:gap-[var(--s-1)]">
            <time className="mono tnum text-[length:var(--t-meta)] text-ink-3">
              {formatDayMonth(publishedAt)}
            </time>
            <span aria-hidden className="text-ink-3 sm:hidden">
              ·
            </span>
            <span className="mono tnum text-[length:var(--t-meta)] text-ink-3">
              {readingTime(content)} min
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
