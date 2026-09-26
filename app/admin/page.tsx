import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get total blogs
  const { count: totalBlogs } = await supabase
    .from('blogs')
    .select('*', { count: 'exact', head: true });

  // Get published blogs
  const { count: publishedBlogs } = await supabase
    .from('blogs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  // Get total projects
  const { count: totalProjects } = await supabase
    .from('gallery')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--gray)]/10 border border-[var(--border)] rounded-2xl">
          <h3 className="text-[var(--fg)]/70 font-medium mb-2">Total Blogs</h3>
          <p className="text-4xl font-bold">{totalBlogs || 0}</p>
        </div>
        
        <div className="p-6 bg-[var(--gray)]/10 border border-[var(--border)] rounded-2xl">
          <h3 className="text-[var(--fg)]/70 font-medium mb-2">Published Blogs</h3>
          <p className="text-4xl font-bold">{publishedBlogs || 0}</p>
        </div>

        <div className="p-6 bg-[var(--gray)]/10 border border-[var(--border)] rounded-2xl">
          <h3 className="text-[var(--fg)]/70 font-medium mb-2">Gallery Projects</h3>
          <p className="text-4xl font-bold">{totalProjects || 0}</p>
        </div>
      </div>

      <div className="pt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/admin/blogs/new"
            className="px-6 py-3 bg-[var(--blue)] text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            + New Blog Post
          </Link>
          <Link 
            href="/admin/gallery/new"
            className="px-6 py-3 bg-[var(--gray)]/20 border border-[var(--border)] rounded-xl font-medium hover:bg-[var(--gray)]/30 transition-colors"
          >
            + New Project
          </Link>
        </div>
      </div>
    </div>
  );
}
