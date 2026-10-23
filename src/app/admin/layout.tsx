import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Painel Administrativo',
  robots: {
    index: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#E6E5E1] bg-white">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-[#E6E5E1] p-6">
            <h1 className="font-serif font-bold text-[#16161A] text-lg">
              The Blog
            </h1>
            <p className="text-xs text-[#8A8A90] mt-1">Admin</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavLink href="/admin/posts" label="Posts" />
            <NavLink href="/admin/comments" label="Comentários" />
            <NavLink href="/admin/tags" label="Tags" />
            <NavLink href="/admin/analytics" label="Estatísticas" />
            <NavLink href="/admin/settings" label="Configurações" />
          </nav>

          {/* Footer */}
          <div className="border-t border-[#E6E5E1] p-4 space-y-3">
            <div className="text-xs">
              <p className="text-[#8A8A90]">Logado como</p>
              <p className="font-medium text-[#16161A]">{session.user.name}</p>
              <p className="text-[#8A8A90]">{session.user.email}</p>
            </div>
            <form
              action={async () => {
                'use server';
                const { signOut } = await import('@/lib/auth');
                await signOut({ redirectTo: '/admin/login' });
              }}
            >
              <button
                type="submit"
                className="w-full text-left text-sm text-[#4B3FBE] hover:text-[#3d328a] font-medium"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm font-medium text-[#55555C] hover:text-[#4B3FBE] hover:bg-[#EDECE8] rounded-lg transition-colors"
    >
      {label}
    </Link>
  );
}
