'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
        const err = await res.json();
        alert(err.error || 'Error creating blog post');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link 
          href="/admin/blogs"
          prefetch={true}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--gray)] hover:text-[var(--blue)] transition-colors mb-3"
        >
          <span>←</span> Back to Articles
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--fg)] tracking-tight">
              Create New Article
            </h1>
            <p className="text-sm text-[var(--gray)] mt-1">
              Draft and publish content connected to your 8 core agency services.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form 
        onSubmit={handleSubmit} 
        className="rounded-2xl border p-8 sm:p-10 space-y-8"
        style={{
          background: 'var(--paper-2)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        {/* Title and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="title">
              Article Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              required
              type="text"
              placeholder="e.g. 10 High-Impact SEO Strategies for 2026"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent"
              style={{
                background: 'var(--paper)',
                borderColor: 'var(--border)',
                color: 'var(--fg)',
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="slug">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-xs text-[var(--gray)] font-mono select-none">
                /blog/
              </span>
              <input
                id="slug"
                required
                type="text"
                placeholder="10-high-impact-seo-strategies"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full pl-16 pr-4 py-3 rounded-xl text-sm font-mono border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent"
                style={{
                  background: 'var(--paper)',
                  borderColor: 'var(--border)',
                  color: 'var(--fg)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="service_tag">
              Service Tag <span className="text-red-500">*</span>
            </label>
            <select
              id="service_tag"
              required
              value={formData.service_tag}
              onChange={(e) => setFormData({ ...formData, service_tag: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent cursor-pointer"
              style={{
                background: 'var(--paper)',
                borderColor: 'var(--border)',
                color: 'var(--fg)',
              }}
            >
              <option value="">Select a service category</option>
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[var(--gray)]">
              This post will automatically appear on the corresponding service detail page.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="status">
              Publication Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent cursor-pointer"
              style={{
                background: 'var(--paper)',
                borderColor: 'var(--border)',
                color: 'var(--fg)',
              }}
            >
              <option value="draft">Draft (Private)</option>
              <option value="published">Published (Visible on site)</option>
            </select>
          </div>
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="cover_image">
            Cover Image URL
          </label>
          <input
            id="cover_image"
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent"
            style={{
              background: 'var(--paper)',
              borderColor: 'var(--border)',
              color: 'var(--fg)',
            }}
          />
          {formData.cover_image && (
            <div className="mt-3 relative w-48 aspect-[16/9] rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              <img src={formData.cover_image} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="content">
              Content (Markdown or HTML) <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-[var(--gray)]">Supports markdown formatting</span>
          </div>
          <textarea
            id="content"
            required
            rows={12}
            placeholder="Write your article content here in Markdown or HTML..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm font-mono border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent resize-y"
            style={{
              background: 'var(--paper)',
              borderColor: 'var(--border)',
              color: 'var(--fg)',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-ghost px-5 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all"
            style={{ borderColor: 'var(--border)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Create Article</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
