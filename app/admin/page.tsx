import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch blogs and gallery in 2 lean parallel queries instead of 5 separate round-trips
  const [
    { data: blogsData },
    { data: galleryData }
  ] = await Promise.all([
    supabase
      .from('blogs')
      .select('id, title, service_tag, status, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('gallery')
      .select('id, name, category, live_link, screenshot, sort_order')
      .order('sort_order', { ascending: true })
  ]);

  const allBlogs = blogsData || [];
  const allProjects = galleryData || [];

  const totalBlogs = allBlogs.length;
  const publishedBlogs = allBlogs.filter((b) => b.status === 'published').length;
  const draftBlogs = totalBlogs - publishedBlogs;
  const totalProjects = allProjects.length;

  const recentBlogs = allBlogs.slice(0, 4);
  const recentProjects = allProjects.slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--blue)]">
            Admin Overview
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--fg)] tracking-tight mt-1">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--gray)] mt-1">
            Manage your digital agency content, case studies, and live publications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/admin/blogs/new"
            prefetch={true}
            className="btn btn-primary text-sm px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Blog Post</span>
          </Link>
          <Link 
            href="/admin/gallery/new"
            prefetch={true}
            className="btn btn-ghost text-sm px-5 py-2.5 rounded-xl font-semibold border transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Blogs */}
        <div 
          className="p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden"
          style={{
            background: 'var(--paper-2)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray)]">Total Articles</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--blue)]/10 text-[var(--blue)] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-extrabold text-[var(--fg)] tracking-tight">
            {totalBlogs || 0}
          </div>
          <div className="mt-3 text-xs text-[var(--gray)] flex items-center gap-2">
            <span className="font-semibold text-[var(--fg)]">{publishedBlogs || 0}</span> published · <span className="font-semibold text-[var(--fg)]">{draftBlogs}</span> drafts
          </div>
        </div>

        {/* Published Blogs */}
        <div 
          className="p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden"
          style={{
            background: 'var(--paper-2)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray)]">Live on Website</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-extrabold text-[var(--fg)] tracking-tight">
            {publishedBlogs || 0}
          </div>
          <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Visible to public visitors
          </div>
        </div>

        {/* Gallery Projects */}
        <div 
          className="p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden"
          style={{
            background: 'var(--paper-2)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray)]">Portfolio Items</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-extrabold text-[var(--fg)] tracking-tight">
            {totalProjects || 0}
          </div>
          <div className="mt-3 text-xs text-[var(--gray)]">
            Featured on Home and /work gallery
          </div>
        </div>
      </div>

      {/* Two Column Section for Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Blogs Card */}
        <div 
          className="p-6 sm:p-7 rounded-2xl border"
          style={{
            background: 'var(--paper-2)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="text-lg font-bold text-[var(--fg)]">Recent Articles</h2>
              <p className="text-xs text-[var(--gray)] mt-0.5">Latest published or drafted content</p>
            </div>
            <Link 
              href="/admin/blogs" 
              prefetch={true}
              className="text-xs font-semibold text-[var(--blue)] hover:underline flex items-center gap-1"
            >
              View all <span>→</span>
            </Link>
          </div>

          <div className="space-y-3">
            {recentBlogs && recentBlogs.length > 0 ? (
              recentBlogs.map((post) => (
                <div 
                  key={post.id} 
                  className="p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all hover:border-[var(--blue)]"
                  style={{ background: 'var(--paper)', borderColor: 'var(--border)' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--fg)] truncate">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--gray)]">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--blue)]/10 text-[var(--blue)]">
                        {post.service_tag || 'General'}
                      </span>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span 
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        post.status === 'published' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {post.status}
                    </span>
                    <Link
                      href={`/admin/blogs/${post.id}/edit`}
                      prefetch={true}
                      className="p-1.5 rounded-lg border text-xs font-medium text-[var(--gray)] hover:text-[var(--blue)] hover:border-[var(--blue)] transition-colors"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-[var(--gray)]">
                No articles yet. Click "New Blog Post" to publish one.
              </div>
            )}
          </div>
        </div>

        {/* Recent Gallery Projects Card */}
        <div 
          className="p-6 sm:p-7 rounded-2xl border"
          style={{
            background: 'var(--paper-2)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="text-lg font-bold text-[var(--fg)]">Client Projects</h2>
              <p className="text-xs text-[var(--gray)] mt-0.5">Top-ranked showcase entries</p>
            </div>
            <Link 
              href="/admin/gallery" 
              prefetch={true}
              className="text-xs font-semibold text-[var(--blue)] hover:underline flex items-center gap-1"
            >
              View all <span>→</span>
            </Link>
          </div>

          <div className="space-y-3">
            {recentProjects && recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all hover:border-[var(--blue)]"
                  style={{ background: 'var(--paper)', borderColor: 'var(--border)' }}
                >
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--paper-2)] border overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-[var(--gray)]" style={{ borderColor: 'var(--border)' }}>
                      {project.screenshot ? (
                        <img src={project.screenshot} alt="" className="w-full h-full object-cover" />
                      ) : (
                        project.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--fg)] truncate">
                        {project.name}
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--gray)]/10 text-[var(--gray)]">
                        {project.category || 'Web'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {project.live_link && (
                      <a
                        href={project.live_link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border text-xs text-[var(--gray)] hover:text-[var(--blue)] transition-colors"
                        style={{ borderColor: 'var(--border)' }}
                        title="View live URL"
                      >
                        ↗
                      </a>
                    )}
                    <Link
                      href={`/admin/gallery/${project.id}/edit`}
                      prefetch={true}
                      className="p-1.5 px-3 rounded-lg border text-xs font-medium text-[var(--gray)] hover:text-[var(--blue)] hover:border-[var(--blue)] transition-colors"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-[var(--gray)]">
                No projects in the gallery yet. Click "New Project" to showcase work.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
