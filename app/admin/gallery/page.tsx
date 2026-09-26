import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import DeleteButton from '../components/DeleteButton';
import ReorderButton from '../components/ReorderButton';

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('gallery')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gallery Projects</h1>
        <Link 
          href="/admin/gallery/new"
          className="px-4 py-2 bg-[var(--blue)] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          + New Project
        </Link>
      </div>

      <div className="bg-[var(--gray)]/5 border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--gray)]/10 border-b border-[var(--border)]">
            <tr>
              <th className="p-4 font-medium w-16">Order</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {projects?.map((project, index) => (
              <tr key={project.id} className="hover:bg-[var(--gray)]/5">
                <td className="p-4">
                  <div className="flex flex-col items-center space-y-1">
                    {index > 0 && (
                      <ReorderButton id={project.id} direction="up" currentOrder={project.sort_order} />
                    )}
                    {index < projects.length - 1 && (
                      <ReorderButton id={project.id} direction="down" currentOrder={project.sort_order} />
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium">{project.name}</td>
                <td className="p-4"><span className="px-2 py-1 bg-[var(--gray)]/20 rounded text-sm">{project.category}</span></td>
                <td className="p-4 text-right space-x-4">
                  <Link href={`/admin/gallery/${project.id}/edit`} className="text-[var(--blue)] hover:underline">
                    Edit
                  </Link>
                  <DeleteButton type="gallery" id={project.id} />
                </td>
              </tr>
            ))}
            {!projects?.length && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[var(--fg)]/50">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
