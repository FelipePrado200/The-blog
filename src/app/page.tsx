import { getPublishedPosts, getAllTags } from '@/lib/posts';
import { PostCard } from '@/components/PostCard';
import Link from 'next/link';

export const metadata = {
  title: 'The Blog',
  description: 'Um blog sobre desenvolvimento, design e tecnologia.',
};

export default async function Home() {
  const { posts, total } = await getPublishedPosts(10, 0);
  const tags = await getAllTags();

  return (
    <>
      {/* Header */}
      <header className="border-b border-[#E6E5E1] py-12 px-4">
        <div className="max-w-[68ch] mx-auto">
          <h1 className="text-5xl font-serif font-bold text-[#16161A] mb-4">
            The Blog
          </h1>
          <p className="text-lg text-[#55555C]">
            Artigos sobre desenvolvimento, design e tecnologia.
          </p>

          {/* Tags Cloud */}
          {tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.slice(0, 12).map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tags/${tag.slug}`}
                  className="text-sm font-medium text-[#55555C] hover:text-[#4B3FBE] bg-[#F7F7F5] hover:bg-[#EDECE8] px-3 py-1.5 rounded-[6px] transition-colors"
                >
                  {tag.name} ({tag._count.posts})
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[68ch] mx-auto py-12 px-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8A8A90]">Nenhum artigo publicado ainda.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                excerpt={post.excerpt}
                slug={post.slug}
                publishedAt={post.publishedAt!}
                author={post.author}
                tags={post.tags}
                views={post.views}
              />
            ))}
          </div>
        )}

        {/* Pagination info */}
        <div className="mt-12 text-center text-sm text-[#8A8A90]">
          Mostrando {posts.length} de {total} artigos
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6E5E1] mt-16 py-8 px-4 text-center text-sm text-[#8A8A90]">
        <p>© 2024 The Blog. Todos os direitos reservados.</p>
      </footer>
    </>
  );
}
