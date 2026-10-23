import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Sobre",
  description: "Quem escreve aqui e por que este blog existe.",
};

/* Troque este bloco pelos seus dados. */
const AUTHOR = {
  name: "Felipe Prado",
  role: "Desenvolvedor Full Stack",
  place: "São Paulo, Brasil",
  github: "https://github.com/FelipePrado200",
};

const STACK = [
  { label: "Front-end", items: "React, Next.js, TypeScript, Tailwind" },
  { label: "Back-end", items: "Node, Prisma, PostgreSQL" },
  { label: "Interesse", items: "Desempenho, interface, segurança ofensiva" },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main
        className="mx-auto px-[var(--gutter)] pt-[var(--s-8)] pb-[var(--s-9)]"
        style={{ maxWidth: "var(--page)" }}
      >
        <p className="rise label" style={{ "--i": 0 } as React.CSSProperties}>
          Sobre
        </p>

        <h1
          className="rise font-display mt-[var(--s-4)] max-w-[22ch] text-[var(--t-h1)] font-semibold leading-[1.08] text-ink"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          Escrever sobre o trabalho melhora o trabalho.
        </h1>

        <div className="mt-[var(--s-8)] grid gap-[var(--s-8)] lg:grid-cols-[1fr_320px] lg:gap-[var(--s-9)]">
          {/* Texto */}
          <div
            className="article rise"
            style={{ "--i": 2, maxWidth: "var(--measure)" } as React.CSSProperties}
          >
            <p>
              Este blog existe por um motivo simples: quase toda decisão técnica
              interessante desaparece sem registro. O commit mostra o resultado,
              nunca as três tentativas antes dele, nem o número que provou qual
              delas funcionava.
            </p>
            <p>
              Aqui eu escrevo o processo inteiro. Quando digo que uma mudança
              deixou algo mais rapido, mostro a medida antes e depois. Quando
              escolho uma biblioteca, explico o que a alternativa fazia pior.
              Texto técnico sem número e opinião.
            </p>

            <h2>Quem escreve</h2>
            <p>
              Sou {AUTHOR.name}, {AUTHOR.role.toLowerCase()} em {AUTHOR.place}.
              Trabalho com interface no front-end e com os dados por trás dela,
              e tenho interesse particular em desempenho de render e em
              segurança ofensiva.
            </p>

            <h2>Como este site funciona</h2>
            <p>
              O próprio blog e um exemplo do que ele descreve. Ele roda em
              Next.js com App Router, guarda os artigos em PostgreSQL com
              Prisma, e tem um painel próprio para escrever e para moderar
              comentário. As páginas de leitura são estáticas, com revalidação,
              para o texto chegar rapido em qualquer conexão.
            </p>
            <p>
              O código está aberto. Se algo aqui for útil para você, leve.
            </p>
          </div>

          {/* Coluna de dados */}
          <aside
            className="rise"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <div className="card p-[var(--s-5)]">
              <p className="label">Ferramentas</p>
              <dl className="mt-[var(--s-4)] space-y-[var(--s-4)]">
                {STACK.map((row) => (
                  <div key={row.label}>
                    <dt className="text-[var(--t-meta)] font-medium text-ink">
                      {row.label}
                    </dt>
                    <dd className="mt-[var(--s-1)] text-[var(--t-ui)] leading-[1.55] text-ink-2">
                      {row.items}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-[var(--s-6)] border-t border-line pt-[var(--s-5)]">
                <a
                  href={AUTHOR.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost w-full"
                >
                  Ver no GitHub
                </a>
              </div>
            </div>

            <div className="mt-[var(--s-4)] card dotted p-[var(--s-5)]">
              <p className="label">Começar a ler</p>
              <p className="mt-[var(--s-3)] text-[var(--t-ui)] leading-[1.55] text-ink-2">
                Os artigos mais longos ficam na home, em destaque.
              </p>
              <Link href="/" className="btn btn-accent mt-[var(--s-5)] w-full">
                Ver os artigos
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
