import { prisma } from "./prisma";
import { slugify } from "./posts";

/*
  Recebe os nomes de tag que vieram do editor e devolve
  as linhas de ligação que o Prisma espera em post.tags.create.
  Tag que ainda não existe e criada aqui.
*/
export async function connectTags(
  input: unknown
): Promise<Array<{ tagId: string }>> {
  const names = Array.isArray(input)
    ? input.map((t) => String(t).trim()).filter(Boolean)
    : [];

  if (names.length === 0) return [];

  // Remove repetida, comparando pelo slug.
  const unique = new Map<string, string>();
  for (const name of names.slice(0, 12)) {
    const slug = slugify(name);
    if (slug && !unique.has(slug)) unique.set(slug, name);
  }

  const rows = await Promise.all(
    [...unique.entries()].map(([slug, name]) =>
      prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { slug, name },
        select: { id: true },
      })
    )
  );

  return rows.map((tag) => ({ tagId: tag.id }));
}

/** Troca todas as tags de um post pelas novas. */
export async function replacePostTags(
  postId: string,
  input: unknown
): Promise<void> {
  const links = await connectTags(input);

  await prisma.$transaction([
    prisma.postTag.deleteMany({ where: { postId } }),
    ...(links.length > 0
      ? [
          prisma.postTag.createMany({
            data: links.map((l) => ({ postId, tagId: l.tagId })),
          }),
        ]
      : []),
  ]);
}
