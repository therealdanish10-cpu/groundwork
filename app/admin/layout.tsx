import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from './components/AdminSidebar';

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar userEmail={user.email} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header 
          className="hidden md:flex h-16 items-center justify-between px-8 border-b sticky top-0 z-20 backdrop-blur-md"
          style={{
            background: 'var(--nav-bg)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gray)]">
              Trelio System
            </span>
            <span className="text-[var(--gray)]/40">/</span>
            <span className="text-xs font-medium text-[var(--blue)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          </div>

          <div className="text-xs font-medium text-[var(--gray)]">
            Signed in as <span className="font-semibold text-[var(--fg)]">{user.email}</span>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
