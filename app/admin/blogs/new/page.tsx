'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SERVICES } from '@/lib/services';

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    service_tag: '',
    content: '',
    cover_image: '',
    status: 'draft'
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    setFormData(prev => ({ ...prev, title, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        router.push('/admin/blogs');
        router.refresh();
      } else {
        alert('Error creating blog post');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">New Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--gray)]/5 p-6 rounded-2xl border border-[var(--border)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--blue)]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Slug</label>
            <input
              required
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--blue)]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Service Tag</label>
            <select
              required
              value={formData.service_tag}
              onChange={(e) => setFormData({ ...formData, service_tag: e.target.value })}
              className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--blue)] [&>option]:bg-[#111]"
            >
              <option value="">Select a service</option>
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--blue)] [&>option]:bg-[#111]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Cover Image URL</label>
          <input
            type="url"
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--blue)]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Content (Markdown/HTML)</label>
          <textarea
            required
            rows={10}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--blue)] resize-y"
          ></textarea>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg font-medium border border-[var(--border)] hover:bg-[var(--gray)]/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[var(--blue)] text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
