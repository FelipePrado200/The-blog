import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCount } from "@/lib/format";

export const metadata = { title: "Tags" };

export default async function AdminTagsPage() {
  const session = await auth();
  const authorId = session!.user.id;

  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { posts: true } },
      posts: {
        where: { post: { authorId, status: "PUBLISHED" } },
        select: { post: { select: { views: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const rows = tags
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      posts: tag._count.posts,
      views: tag.posts.reduce((sum, link) => sum + link.post.views, 0),
    }))
    .sort((a, b) => b.posts - a.posts || a.name.localeCompare(b.name));

  const unused = rows.filter((t) => t.posts === 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--panel)" }}>
      <header
        className="border-b border-line px-[var(--s-6)] py-[var(--s-6)]"
        style={{ background: "var(--paper)" }}
      >
        <div className="mx-auto max-w-[900px]">
          <p className="label">Painel</p>
          <h1 className="font-display mt-[var(--s-2)] text-[2rem] font-semibold leading-none text-ink">
            Tags
          </h1>
          <p className="mt-[var(--s-4)] max-w-[52ch] text-[var(--t-ui)] leading-[1.6] text-ink-2">
            As tags nascem no editor. Escreva o nome ao salvar um post e ela
            passa a existir aqui.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[900px] px-[var(--s-6)] py-[var(--s-6)]">
        {rows.length === 0 ? (
          <div
            className="card dotted grid place-items-center px-[var(--s-6)] py-[var(--s-9)] text-center"
            style={{ background: "var(--paper)" }}
          >
            <p className="font-display text-[1.375rem] font-semibold text-ink">
              Nenhuma tag ainda.
            </p>
            <p className="mt-[var(--s-2)] max-w-[40ch] text-[var(--t-ui)] text-ink-2">
              Abra um post no editor e escreva as tags no campo da direita.
            </p>
            <Link href="/admin/editor" className="btn btn-accent mt-[var(--s-5)]">
              Ir para o editor
            </Link>
          </div>
        ) : (
          <>
            <div
              className="card overflow-hidden"
              style={{ background: "var(--paper)" }}
            >
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr style={{ background: "var(--panel)" }}>
                    <th className="label px-[var(--s-4)] py-[var(--s-3)]">
                      Tag
                    </th>
                    <th className="label px-[var(--s-4)] py-[var(--s-3)]">
                      Endereço
                    </th>
                    <th
                      className="label px-[var(--s-4)] py-[var(--s-3)]"
                      style={{ textAlign: "right" }}
                    >
                      Posts
                    </th>
                    <th
                      className="label px-[var(--s-4)] py-[var(--s-3)]"
                      style={{ textAlign: "right" }}
                    >
                      Leituras
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((tag) => (
                    <tr
                      key={tag.id}
                      className="border-t border-line transition-colors duration-200 ease-[var(--ease-io)] hover:bg-panel"
                    >
                      <td className="px-[var(--s-4)] py-[var(--s-4)]">
                        <span className="text-[var(--t-ui)] font-medium text-ink">
                          {tag.name}
                        </span>
                      </td>
                      <td className="px-[var(--s-4)] py-[var(--s-4)]">
                        {tag.posts > 0 ? (
                          <a
                            href={`/tags/${tag.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mono text-[var(--t-micro)] text-ink-3 transition-colors duration-200 hover:text-accent"
                          >
                            /tags/{tag.slug}
                          </a>
                        ) : (
                          <span className="mono text-[var(--t-micro)] text-ink-3">
                            /tags/{tag.slug}
                          </span>
                        )}
                      </td>
                      <td className="mono tnum px-[var(--s-4)] py-[var(--s-4)] text-right text-[var(--t-meta)] text-ink-2">
                        {tag.posts > 0 ? formatCount(tag.posts) : "·"}
                      </td>
                      <td className="mono tnum px-[var(--s-4)] py-[var(--s-4)] text-right text-[var(--t-meta)] text-ink-2">
                        {tag.views > 0 ? formatCount(tag.views) : "·"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {unused.length > 0 ? (
              <p className="mt-[var(--s-4)] text-[var(--t-meta)] text-ink-3">
                {unused.length === 1
                  ? "1 tag não está em nenhum post."
                  : `${unused.length} tags não estão em nenhum post.`}{" "}
                Tag sem post não aparece no site.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
