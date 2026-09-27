import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import DeleteButton from '../components/DeleteButton';
import ReorderButton from '../components/ReorderButton';

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('gallery')
    .select('id, name, description, category, screenshot, screenshot_url, live_link, live_link_url, sort_order')
    .order('sort_order', { ascending: true });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-[var(--fg)] tracking-tight">
              Work Gallery
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--blue)]/10 text-[var(--blue)]">
              {projects?.length || 0}
            </span>
          </div>
          <p className="text-sm text-[var(--gray)] mt-1">
            Manage, arrange, and showcase client case studies on the home page and /work gallery.
          </p>
        </div>

        <Link 
          href="/admin/gallery/new"
          prefetch={true}
          className="btn btn-primary text-sm px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Project</span>
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
                <th className="py-4 px-6 font-bold w-20 text-center">Order</th>
                <th className="py-4 px-6 font-bold">Project Details</th>
                <th className="py-4 px-6 font-bold">Category</th>
                <th className="py-4 px-6 font-bold">Live Link</th>
                <th className="py-4 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {projects && projects.length > 0 ? (
                projects.map((project, index) => {
                  const screenshot = project.screenshot || project.screenshot_url;
                  const liveLink = project.live_link || project.live_link_url;

                  return (
                    <tr 
                      key={project.id} 
                      className="transition-colors hover:bg-[var(--border)]/20"
                    >
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 bg-[var(--paper)] p-1 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                          <ReorderButton 
                            id={project.id} 
                            direction="up" 
                            currentOrder={project.sort_order} 
                          />
                          <ReorderButton 
                            id={project.id} 
                            direction="down" 
                            currentOrder={project.sort_order} 
                          />
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-[var(--fg)] max-w-xs sm:max-w-md">
                        <div className="flex items-center gap-3.5">
                          <div 
                            className="w-12 h-12 rounded-xl border overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold text-[var(--gray)]" 
                            style={{ 
                              background: 'var(--paper)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            {screenshot ? (
                              <img src={screenshot} alt="" className="w-full h-full object-cover" />
                            ) : (
                              project.name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate block font-bold text-[var(--fg)]">
                              {project.name}
                            </p>
                            <p className="text-xs text-[var(--gray)] line-clamp-1 mt-0.5">
                              {project.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--gray)]/10 text-[var(--gray)] border" style={{ borderColor: 'var(--border)' }}>
                          {project.category || 'Web'}
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {liveLink ? (
                          <a 
                            href={liveLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--blue)] hover:underline"
                          >
                            <span className="truncate max-w-[140px]">{liveLink.replace(/^https?:\/\//, '')}</span>
                            <span>↗</span>
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--gray)]">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/admin/gallery/${project.id}/edit`} 
                            prefetch={true}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border text-[var(--fg)] hover:text-[var(--blue)] hover:border-[var(--blue)] bg-[var(--paper)] transition-all"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Edit</span>
                          </Link>
                          <DeleteButton type="gallery" id={project.id} itemTitle={project.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--blue)]/10 text-[var(--blue)] flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-[var(--fg)]">No projects created yet</h3>
                      <p className="text-xs text-[var(--gray)] mt-1 mb-4">
                        Add case studies and web/mobile apps to display on your work gallery.
                      </p>
                      <Link 
                        href="/admin/gallery/new" 
                        className="btn btn-primary text-xs px-4 py-2 rounded-xl font-semibold"
                      >
                        + Add First Project
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
