import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import LogoutButton from './components/LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--gray)]/5 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded-lg hover:bg-[var(--gray)]/10 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/blogs" className="block px-4 py-2 rounded-lg hover:bg-[var(--gray)]/10 transition-colors">
            Blogs
          </Link>
          <Link href="/admin/gallery" className="block px-4 py-2 rounded-lg hover:bg-[var(--gray)]/10 transition-colors">
            Gallery
          </Link>
        </nav>
        <div className="p-4 border-t border-[var(--border)]">
          <Link href="/" className="block px-4 py-2 text-sm rounded-lg hover:bg-[var(--gray)]/10 transition-colors">
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--gray)]/5">
          <div className="md:hidden font-bold">Admin Panel</div>
          <div className="hidden md:block"></div>
          <LogoutButton />
        </header>
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
