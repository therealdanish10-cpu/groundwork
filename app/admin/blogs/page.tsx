import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import DeleteButton from '../components/DeleteButton';
import { SERVICES } from '@/lib/services';

export default async function AdminBlogsPage() {
  const supabase = await createClient();
  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, title, slug, service_tag, status, cover_image, created_at')
    .order('created_at', { ascending: false });

  const getServiceName = (tag: string) => {
    const s = SERVICES.find(srv => srv.slug === tag);
    return s ? s.name : tag;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-[var(--fg)] tracking-tight">
              Blog Articles
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--blue)]/10 text-[var(--blue)]">
              {blogs?.length || 0}
            </span>
          </div>
          <p className="text-sm text-[var(--gray)] mt-1">
            Create, edit, and organize articles published to your services and master blog feed.
          </p>
        </div>

        <Link 
          href="/admin/blogs/new"
          prefetch={true}
          className="btn btn-primary text-sm px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Article</span>
        </Link>
      </div>

      {/* Table Card */}
      <div 
        className="rounded-2xl border overflow-hidden transition-all"
        style={{
          background: 'var(--paper-2)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead 
              className="text-[11px] uppercase tracking-wider font-bold border-b"
              style={{
                background: 'var(--paper)',
                borderColor: 'var(--border)',
                color: 'var(--gray)',
              }}
            >
              <tr>
                <th className="py-4 px-6 font-bold">Article Title</th>
                <th className="py-4 px-6 font-bold">Service Category</th>
                <th className="py-4 px-6 font-bold">Status</th>
                <th className="py-4 px-6 font-bold">Created</th>
                <th className="py-4 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {blogs && blogs.length > 0 ? (
                blogs.map((blog) => (
                  <tr 
                    key={blog.id} 
                    className="transition-colors hover:bg-[var(--border)]/20"
                  >
                    <td className="py-4 px-6 font-semibold text-[var(--fg)] max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-3">
                        {blog.cover_image && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--border)' }}>
                            <img src={blog.cover_image} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link 
                            href={`/blog/${blog.slug}`} 
                            target="_blank"
                            className="hover:text-[var(--blue)] transition-colors truncate block"
                            title="View public article"
                          >
                            {blog.title}
                          </Link>
                          <span className="text-[11px] text-[var(--gray)] font-mono">
                            /{blog.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--blue)]/10 text-[var(--blue)]">
                        {getServiceName(blog.service_tag)}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          blog.status === 'published' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${blog.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {blog.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-[var(--gray)]">
                      {new Date(blog.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/blogs/${blog.id}/edit`} 
                          prefetch={true}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border text-[var(--fg)] hover:text-[var(--blue)] hover:border-[var(--blue)] bg-[var(--paper)] transition-all"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span>Edit</span>
                        </Link>
                        <DeleteButton type="blog" id={blog.id} itemTitle={blog.title} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--blue)]/10 text-[var(--blue)] flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-[var(--fg)]">No articles created yet</h3>
                      <p className="text-xs text-[var(--gray)] mt-1 mb-4">
                        Share insights, guides, and news categorized by your services.
                      </p>
                      <Link 
                        href="/admin/blogs/new" 
                        className="btn btn-primary text-xs px-4 py-2 rounded-xl font-semibold"
                      >
                        + Write First Article
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
