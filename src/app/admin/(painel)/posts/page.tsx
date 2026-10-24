import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatShortDate, formatCount } from "@/lib/format";

export const metadata = { title: "Posts" };

const STATUS = {
  DRAFT: { label: "Rascunho", fg: "var(--neutral)", bg: "var(--neutral-wash)" },
  SCHEDULED: { label: "Agendado", fg: "var(--warn)", bg: "var(--warn-wash)" },
  PUBLISHED: { label: "Publicado", fg: "var(--ok)", bg: "var(--ok-wash)" },
} as const;

export default async function AdminPostsPage() {
  const session = await auth();
  const authorId = session!.user.id;

  const [posts, pendingComments] = await Promise.all([
    prisma.post.findMany({
      where: { authorId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        views: true,
        publishedAt: true,
        updatedAt: true,
        _count: { select: { comments: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.comment.count({
      where: { status: "PENDING", post: { authorId } },
    }),
  ]);

  const published = posts.filter((p) => p.status === "PUBLISHED").length;
  const drafts = posts.filter((p) => p.status === "DRAFT").length;
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--panel)" }}>
      {/* ===== Cabecalho ===== */}
      <header
        className="border-b border-line px-[var(--s-6)] py-[var(--s-6)]"
        style={{ background: "var(--paper)" }}
      >
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-end justify-between gap-[var(--s-4)]">
          <div>
            <p className="label">Painel</p>
            <h1 className="font-display mt-[var(--s-2)] text-[2rem] font-semibold leading-none text-ink">
              Posts
            </h1>
          </div>
          <Link href="/admin/editor" className="btn btn-accent">
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M8 3v10M3 8h10" />
            </svg>
            Novo post
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-[var(--s-6)] py-[var(--s-6)]">
        {/* ===== Numeros ===== */}
        <dl className="grid grid-cols-2 gap-[var(--s-3)] sm:grid-cols-4">
          <Stat label="Publicados" value={formatCount(published)} index={0} />
          <Stat label="Rascunhos" value={formatCount(drafts)} index={1} />
          <Stat label="Leituras" value={formatCount(totalViews)} index={2} />
          <Stat
            label="A revisar"
            value={formatCount(pendingComments)}
            index={3}
            highlight={pendingComments > 0}
            href={pendingComments > 0 ? "/admin/comments" : undefined}
          />
        </dl>

        {/* ===== Tabela ===== */}
        <div
          className="card mt-[var(--s-6)] overflow-hidden"
          style={{ background: "var(--paper)" }}
        >
          {posts.length === 0 ? (
            <div className="dotted grid place-items-center px-[var(--s-6)] py-[var(--s-9)] text-center">
              <p className="font-display text-[1.375rem] font-semibold text-ink">
                Nenhum post ainda.
              </p>
              <p className="mt-[var(--s-2)] max-w-[40ch] text-[length:var(--t-ui)] text-ink-2">
                O editor aceita Markdown e MDX, e salva rascunho antes de
                publicar.
              </p>
              <Link href="/admin/editor" className="btn btn-accent mt-[var(--s-5)]">
                Escrever o primeiro
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr style={{ background: "var(--panel)" }}>
                    <Th>Título</Th>
                    <Th>Situação</Th>
                    <Th align="right">Data</Th>
                    <Th align="right">Leituras</Th>
                    <Th align="right">Comentários</Th>
                    <Th align="right">Acoes</Th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const meta = STATUS[post.status];
                    const date =
                      post.status === "PUBLISHED" && post.publishedAt
                        ? post.publishedAt
                        : post.updatedAt;

                    return (
                      <tr
                        key={post.id}
                        className="border-t border-line transition-colors duration-200 ease-[var(--ease-io)] hover:bg-panel"
                      >
                        <td className="px-[var(--s-4)] py-[var(--s-4)]">
                          <Link
                            href={`/admin/editor?id=${post.id}`}
                            className="block max-w-[38ch]"
                          >
                            <span className="text-[length:var(--t-ui)] font-medium text-ink">
                              {post.title || "Sem título"}
                            </span>
                            <span className="mono mt-[2px] block truncate text-[length:var(--t-micro)] text-ink-3">
                              /posts/{post.slug}
                            </span>
                          </Link>
                        </td>

                        <td className="px-[var(--s-4)] py-[var(--s-4)]">
                          <span
                            className="pill"
                            style={{ color: meta.fg, background: meta.bg }}
                          >
                            {meta.label}
                          </span>
                        </td>

                        <td className="mono tnum px-[var(--s-4)] py-[var(--s-4)] text-right text-[length:var(--t-meta)] text-ink-2">
                          {formatShortDate(date)}
                        </td>

                        <td className="mono tnum px-[var(--s-4)] py-[var(--s-4)] text-right text-[length:var(--t-meta)] text-ink-2">
                          {post.status === "PUBLISHED"
                            ? formatCount(post.views)
                            : "·"}
                        </td>

                        <td className="mono tnum px-[var(--s-4)] py-[var(--s-4)] text-right text-[length:var(--t-meta)] text-ink-2">
                          {post._count.comments > 0
                            ? formatCount(post._count.comments)
                            : "·"}
                        </td>

                        <td className="px-[var(--s-4)] py-[var(--s-4)] text-right">
                          <div className="flex items-center justify-end gap-[var(--s-3)]">
                            <Link
                              href={`/admin/editor?id=${post.id}`}
                              className="text-[length:var(--t-meta)] font-medium text-accent link-grow"
                            >
                              Editar
                            </Link>
                            {post.status === "PUBLISHED" ? (
                              <a
                                href={`/posts/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[length:var(--t-meta)] text-ink-3 transition-colors duration-200 hover:text-ink"
                              >
                                Ver
                              </a>
                            ) : null}
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

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className="label px-[var(--s-4)] py-[var(--s-3)]"
      style={{ textAlign: align, fontWeight: 560 }}
    >
      {children}
    </th>
  );
}

function Stat({
  label,
  value,
  index,
  highlight,
  href,
}: {
  label: string;
  value: string;
  index: number;
  highlight?: boolean;
  href?: string;
}) {
  const inner = (
    <div
      className="card rise h-full p-[var(--s-4)] transition-[border-color,box-shadow] duration-200 ease-[var(--ease-io)]"
      style={
        {
          "--i": index,
          background: "var(--paper)",
          borderColor: highlight ? "var(--accent-line)" : "var(--line)",
        } as React.CSSProperties
      }
    >
      <dt className="label">{label}</dt>
      <dd
        className="font-display tnum mt-[var(--s-2)] text-[1.75rem] font-semibold leading-none"
        style={{ color: highlight ? "var(--accent)" : "var(--ink)" }}
      >
        {value}
      </dd>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
