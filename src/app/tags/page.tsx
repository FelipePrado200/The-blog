import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getAllTags } from "@/lib/posts";

export const metadata = {
  title: "Tags",
  description: "Todos os temas cobertos no blog.",
};

export const revalidate = 300;

export default async function TagsPage() {
  const tags = await getAllTags();
  const withPosts = tags.filter((t) => t.count > 0);

  return (
    <>
      <SiteHeader />

      <main
        className="mx-auto min-h-[60vh] px-[var(--gutter)] pt-[var(--s-8)] pb-[var(--s-9)]"
        style={{ maxWidth: "var(--page)" }}
      >
        <p className="rise label" style={{ "--i": 0 } as React.CSSProperties}>
          Indice
        </p>
        <h1
          className="rise font-display mt-[var(--s-4)] text-[var(--t-h1)] font-semibold leading-[1.08] text-ink"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          Tags
        </h1>
        <p
          className="rise mt-[var(--s-5)] max-w-[48ch] text-[var(--t-lead)] leading-[var(--lh-lead)] text-ink-2"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          Os temas que aparecem com mais frequência aqui.
        </p>

        {withPosts.length === 0 ? (
          <p className="mt-[var(--s-8)] text-[var(--t-ui)] text-ink-3">
            Nenhuma tag em uso ainda.
          </p>
        ) : (
          <ul
            className="mt-[var(--s-8)]"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            {withPosts.map((tag, i) => (
              <li
                key={tag.slug}
                className="rise"
                style={{ "--i": i } as React.CSSProperties}
              >
                <Link
                  href={`/tags/${tag.slug}`}
                  className="group flex items-baseline justify-between gap-[var(--s-5)] border-t border-line py-[var(--s-5)] transition-[border-color] duration-300 ease-[var(--ease-io)] hover:border-ink-3"
                >
                  <span className="font-display text-[1.375rem] font-semibold text-ink">
                    <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-[2px] transition-[background-size] duration-500 ease-[var(--ease)] group-hover:bg-[length:100%_1px]">
                      {tag.name}
                    </span>
                  </span>
                  <span className="mono tnum text-[var(--t-meta)] text-ink-3 transition-colors duration-300 group-hover:text-accent">
                    {String(tag.count).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
