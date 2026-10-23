import { PrismaClient, type PostStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();

const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), "content");

/*
  O autor do seed.
  Troque o e-mail pelo e-mail da sua conta do GitHub, para que o
  primeiro login no painel se ligue a estes posts em vez de criar
  um segundo usuário.
*/
const AUTHOR = {
  email: process.env.SEED_AUTHOR_EMAIL ?? "felipe@example.com",
  name: process.env.SEED_AUTHOR_NAME ?? "Felipe Prado",
};

type SeedPost = {
  file: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  status: PostStatus;
  daysAgo: number;
};

const POSTS: SeedPost[] = [
  {
    file: "canvas-4x-mais-rapido.md",
    slug: "canvas-4x-mais-rapido-sem-perder-qualidade",
    title: "Como eu tirei 4x mais quadros de um canvas sem perder qualidade",
    excerpt:
      "Um portfólio rodava a 6 quadros por segundo. Três mudanças o levaram a 30, com a mesma imagem na tela. Uma delas é identidade trigonométrica, e a outra me ensinou a desconfiar da minha própria métrica.",
    tags: ["Desempenho", "Canvas", "JavaScript"],
    status: "PUBLISHED",
    daysAgo: 2,
  },
  {
    file: "camada-de-tokens-css.md",
    slug: "camada-de-tokens-css-antes-do-tailwind",
    title: "Quando o Tailwind não basta: a camada de tokens que vem antes",
    excerpt:
      "Tailwind resolve escrever CSS, não ter um sistema. A diferença aparece no dia em que você precisa de tema escuro, e descobre a decisão de design espalhada por quarenta componentes.",
    tags: ["CSS", "Design System", "Tailwind"],
    status: "PUBLISHED",
    daysAgo: 9,
  },
  {
    file: "comentarios-proprios-ou-giscus.md",
    slug: "comentarios-proprios-ou-giscus",
    title: "Comentário próprio ou giscus: por que eu troquei de lado",
    excerpt:
      "Eu escolhi o giscus e voltei atrás. A troca não foi técnica, foi de contexto: quando o projeto já tem banco, a conta do custo muda inteira.",
    tags: ["Arquitetura", "Prisma", "Privacidade"],
    status: "PUBLISHED",
    daysAgo: 17,
  },
  {
    file: "tres-defeitos-github-pages.md",
    slug: "tres-defeitos-que-so-aparecem-em-producao",
    title: "Três defeitos que só apareceram depois de publicar",
    excerpt:
      "Modo quirks, acento quebrado e um site de 980 pixels no celular. Os três estavam escondidos pelo ambiente de prévia, que consertava o meu arquivo sem me avisar.",
    tags: ["HTML", "Depuração"],
    status: "PUBLISHED",
    daysAgo: 28,
  },
];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(9, 30, 0, 0);
  return date;
}

async function main() {
  console.log("Populando o banco.");

  // ---- Autor ----
  const author = await prisma.user.upsert({
    where: { email: AUTHOR.email },
    update: { name: AUTHOR.name },
    create: { email: AUTHOR.email, name: AUTHOR.name, role: "ADMIN" },
  });
  console.log(`  autor: ${author.name} <${author.email}>`);

  // ---- Tags ----
  const tagNames = [...new Set(POSTS.flatMap((p) => p.tags))];
  const tagBySlug = new Map<string, string>();

  for (const name of tagNames) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });
    tagBySlug.set(slug, tag.id);
  }
  console.log(`  tags: ${tagNames.length}`);

  // ---- Posts ----
  for (const item of POSTS) {
    const content = readFileSync(join(CONTENT_DIR, item.file), "utf8");
    const publishedAt =
      item.status === "PUBLISHED" ? daysAgo(item.daysAgo) : null;

    const post = await prisma.post.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        content,
        excerpt: item.excerpt,
        status: item.status,
        publishedAt,
      },
      create: {
        slug: item.slug,
        title: item.title,
        content,
        excerpt: item.excerpt,
        status: item.status,
        publishedAt,
        authorId: author.id,
        views: Math.floor(Math.random() * 400) + 60,
      },
    });

    // Refaz as ligações de tag, para o seed poder rodar outra vez.
    await prisma.postTag.deleteMany({ where: { postId: post.id } });
    await prisma.postTag.createMany({
      data: item.tags
        .map((name) => tagBySlug.get(slugify(name)))
        .filter((id): id is string => Boolean(id))
        .map((tagId) => ({ postId: post.id, tagId })),
    });

    console.log(`  post: ${item.slug}`);
  }

  // ---- Um comentário de exemplo, aprovado ----
  const first = await prisma.post.findUnique({
    where: { slug: POSTS[0].slug },
    select: { id: true, _count: { select: { comments: true } } },
  });

  if (first && first._count.comments === 0) {
    await prisma.comment.create({
      data: {
        postId: first.id,
        name: "Ana Ribeiro",
        email: "ana@example.com",
        content:
          "A parte sobre a métrica que discorda do olho foi a que mais me pegou. Eu já publiquei coisa pior por confiar em um número que media a coisa errada.",
        status: "APPROVED",
      },
    });
    console.log("  comentário de exemplo criado");
  }

  console.log("Pronto.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
