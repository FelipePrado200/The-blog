import { getPostBySlug, getPublishedPosts, incrementPostViews } from '@/lib/posts';
import { getApprovedComments } from '@/lib/comments';
import { Post } from '@/components/Post';
import { Comments } from '@/components/Comments';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'PUBLISHED') {
    return {
      title: 'Post não encontrado',
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

export async function generateStaticParams() {
  const { posts } = await getPublishedPosts(100, 0);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  // Increment views
  await incrementPostViews(post.id);

  // Get comments
  const comments = await getApprovedComments(post.id);

  return (
    <article>
      {/* Navigation */}
      <nav className="border-b border-[#E6E5E1] py-4 px-4 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="max-w-[68ch] mx-auto">
          <Link
            href="/"
            className="text-[#4B3FBE] hover:text-[#3d328a] font-medium text-sm"
          >
            ← Voltar ao blog
          </Link>
        </div>
      </nav>

      {/* Hero / Cover Image */}
      {post.coverImage && (
        <div className="w-full h-96 overflow-hidden bg-[#F7F7F5]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post Content */}
      <Post
        title={post.title}
        author={post.author}
        publishedAt={post.publishedAt!}
        tags={post.tags}
        views={post.views}
      >
        <MDXRemote source={post.content} />
      </Post>

      {/* Comments Section */}
      <Comments postId={post.id} comments={comments} />

      {/* Related Posts */}
      {post.tags.length > 0 && (
        <section className="max-w-[68ch] mx-auto py-12 px-4 border-t border-[#E6E5E1]">
          <h2 className="text-2xl font-serif font-bold text-[#16161A] mb-8">
            Artigos relacionados
          </h2>
          {/* TODO: Implementar carregamento de posts relacionados */}
        </section>
      )}
    </article>
  );
}
