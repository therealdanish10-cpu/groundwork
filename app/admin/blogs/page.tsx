import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import DeleteButton from '../components/DeleteButton';

export default async function AdminBlogsPage() {
  const supabase = await createClient();
  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blogs</h1>
        <Link 
          href="/admin/blogs/new"
          className="px-4 py-2 bg-[var(--blue)] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          + New Post
        </Link>
      </div>

      <div className="bg-[var(--gray)]/5 border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--gray)]/10 border-b border-[var(--border)]">
            <tr>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Service Tag</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {blogs?.map((blog) => (
              <tr key={blog.id} className="hover:bg-[var(--gray)]/5">
                <td className="p-4">{blog.title}</td>
                <td className="p-4"><span className="px-2 py-1 bg-[var(--gray)]/20 rounded text-sm">{blog.service_tag}</span></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${blog.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {blog.status}
                  </span>
                </td>
                <td className="p-4 text-[var(--fg)]/70 text-sm">
                  {new Date(blog.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right space-x-4">
                  <Link href={`/admin/blogs/${blog.id}/edit`} className="text-[var(--blue)] hover:underline">
                    Edit
                  </Link>
                  <DeleteButton type="blog" id={blog.id} />
                </td>
              </tr>
            ))}
            {!blogs?.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--fg)]/50">
                  No blog posts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
