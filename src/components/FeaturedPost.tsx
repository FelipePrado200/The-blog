import Link from "next/link";
import { formatFullDate, isoDate, readingTime } from "@/lib/format";

interface FeaturedPostProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  publishedAt: Date | null;
  author: { name: string | null };
  tags?: Array<{ tag: { name: string; slug: string } }>;
}

export function FeaturedPost({
  title,
  slug,
  excerpt,
  content,
  coverImage,
  publishedAt,
  author,
  tags,
}: FeaturedPostProps) {
  return (
    <article className="relative">
      {/* Rotulo */}
      <div
        className="rise flex items-center gap-[var(--s-3)]"
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <span className="label" style={{ color: "var(--accent)" }}>
          Em destaque
        </span>
        <span
          aria-hidden
          className="h-px flex-1"
          style={{ background: "var(--line)" }}
        />
      </div>

      <Link href={`/posts/${slug}`} className="group mt-[var(--s-5)] block">
        <div className="grid gap-[var(--s-6)] lg:grid-cols-[1.15fr_0.85fr] lg:gap-[var(--s-8)]">
          {/* Coluna de texto */}
          <div>
            <h2
              className="rise font-display text-[length:var(--t-h1)] font-semibold leading-[1.08] text-ink"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat pb-[3px] transition-[background-size] duration-[600ms] ease-[var(--ease)] group-hover:bg-[length:100%_2px]">
                {title}
              </span>
            </h2>

            {excerpt ? (
              <p
                className="rise mt-[var(--s-5)] max-w-[52ch] text-[length:var(--t-lead)] leading-[var(--lh-lead)] text-ink-2"
                style={{ "--i": 2 } as React.CSSProperties}
              >
                {excerpt}
              </p>
            ) : null}

            {/* Dados */}
            <div
              className="rise mt-[var(--s-6)] flex flex-wrap items-center gap-x-[var(--s-4)] gap-y-[var(--s-2)]"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              <span className="text-[length:var(--t-ui)] font-medium text-ink">
                {author.name ?? "Redacao"}
              </span>
              <span aria-hidden className="text-ink-3">
                ·
              </span>
              <time
                dateTime={isoDate(publishedAt)}
                className="text-[length:var(--t-ui)] text-ink-2"
              >
                {formatFullDate(publishedAt)}
              </time>
              <span aria-hidden className="text-ink-3">
                ·
              </span>
              <span className="mono tnum text-[length:var(--t-meta)] text-ink-3">
                {readingTime(content)} min de leitura
              </span>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 ? (
              <ul
                className="rise mt-[var(--s-5)] flex flex-wrap gap-[var(--s-2)]"
                style={{ "--i": 4 } as React.CSSProperties}
              >
                {tags.map(({ tag }) => (
                  <li
                    key={tag.slug}
                    className="label px-[var(--s-3)] py-[5px]"
                    style={{
                      borderRadius: "var(--r-full)",
                      background: "var(--accent-wash)",
                      color: "var(--accent)",
                    }}
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            ) : null}

            <span
              className="rise mt-[var(--s-6)] inline-flex items-center gap-[var(--s-2)] text-[length:var(--t-ui)] font-medium text-accent"
              style={{ "--i": 5 } as React.CSSProperties}
            >
              Ler o artigo
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden
                className="transition-transform duration-300 ease-[var(--ease)] group-hover:translate-x-[3px]"
              >
                <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
              </svg>
            </span>
          </div>

          {/* Coluna visual */}
          <div
            className="rise order-first lg:order-none"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: "var(--r-lg)",
                border: "1px solid var(--line)",
                aspectRatio: "4 / 3",
                background: "var(--panel)",
              }}
            >
              {coverImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={coverImage}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-[700ms] ease-[var(--ease)] group-hover:scale-[1.03]"
                />
              ) : (
                <CoverFallback title={title} />
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

/*
  Capa gerada quando o post não tem imagem.
  Usa as iniciais do título sobre uma trama de pontos.
  Evita a aparência de espaco vazio sem precisar de banco de imagens.
*/
function CoverFallback({ title }: { title: string }) {
  const initials = title
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="dotted relative grid h-full w-full place-items-center">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 20% 0%, var(--accent-wash), transparent 60%)",
        }}
      />
      <span
        aria-hidden
        className="font-display relative text-[4rem] font-semibold leading-none"
        style={{ color: "var(--accent)", opacity: 0.5 }}
      >
        {initials || "TB"}
      </span>
    </div>
  );
}
