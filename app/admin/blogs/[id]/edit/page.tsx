'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SERVICES } from '@/lib/services';
import BlogMarkdown from '@/app/components/BlogMarkdown';
import React from 'react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trimStart()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function EditBlogPage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isSlugCustomized, setIsSlugCustomized] = useState(true);
  const [contentTab, setContentTab] = useState<'write' | 'preview' | 'split'>('write');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    service_tag: '',
    content: '',
    cover_image: '',
    status: 'draft'
  });

  useEffect(() => {
    const fetchPost = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
      if (data && !error) {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          service_tag: data.service_tag || '',
          content: data.content || '',
          cover_image: data.cover_image || '',
          status: data.status || 'draft'
        });
      }
      setFetching(false);
    };
    fetchPost();
  }, [id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!isSlugCustomized) {
      const slug = slugify(title);
      setFormData(prev => ({ ...prev, title, slug }));
    } else {
      setFormData(prev => ({ ...prev, title }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value;
    if (slug === '') {
      setIsSlugCustomized(false);
      setFormData(prev => ({ ...prev, slug: slugify(formData.title).replace(/-+$/, '') }));
    } else {
      setIsSlugCustomized(true);
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blogs/${fileName}`;

      const { data, error } = await supabase.storage.from('gallery').upload(filePath, file);
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
        setFormData(prev => ({ ...prev, cover_image: publicUrl }));
        setUploading(false);
        return;
      }
    } catch (err) {
      console.warn('Direct Supabase storage upload fell back:', err);
    }

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('bucket', 'gallery');
      uploadData.append('folder', 'blogs');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadData
      });

      if (res.ok) {
        const result = await res.json();
        if (result.publicUrl) {
          setFormData(prev => ({ ...prev, cover_image: result.publicUrl }));
          setUploading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API upload fell back:', err);
    }

    // Fallback: Read as base64 data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, cover_image: reader.result as string }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      alert('Please enter article content');
      return;
    }

    setLoading(true);

    const cleanSlug = formData.slug.trim().replace(/^-+|-+$/g, '');
    const submissionData = {
      id,
      ...formData,
      slug: cleanSlug || slugify(formData.title).replace(/^-+|-+$/g, '')
    };

    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (res.ok) {
        router.push('/admin/blogs');
      } else {
        const err = await res.json();
        alert(err.error || 'Error updating blog post');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Error updating blog post');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--blue)]/30 border-t-[var(--blue)] rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[var(--gray)]">Loading article...</p>
      </div>
    );
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--fg)] tracking-tight">
              Edit Article
            </h1>
            <p className="text-sm text-[var(--gray)] mt-1">
              Update article details, service association, or publication status.
            </p>
          </div>

          <Link
            href={`/blog/${formData.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--blue)] hover:underline self-start sm:self-auto"
          >
            <span>Preview live page</span>
            <span>↗</span>
          </Link>
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
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="slug">
                URL Slug <span className="text-red-500">*</span>
              </label>
              {isSlugCustomized && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSlugCustomized(false);
                    setFormData(prev => ({ ...prev, slug: slugify(prev.title).replace(/-+$/, '') }));
                  }}
                  className="text-xs text-[var(--blue)] hover:underline cursor-pointer"
                >
                  Reset to auto-generated
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-xs text-[var(--gray)] font-mono select-none">
                /blog/
              </span>
              <input
                id="slug"
                required
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
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

        {/* Cover Image Upload / URL */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="cover_image">
              Cover Image
            </label>
            {formData.cover_image && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                className="text-xs text-red-500 hover:underline cursor-pointer"
              >
                Remove image
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* File Upload Trigger */}
            <div 
              className="p-4 rounded-xl border border-dashed text-center flex flex-col items-center justify-center cursor-pointer hover:border-[var(--blue)] transition-colors"
              style={{ background: 'var(--paper)', borderColor: 'var(--border)' }}
            >
              <input
                type="file"
                id="cover-image-upload"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="cover-image-upload" className="cursor-pointer flex flex-col items-center">
                <svg className="w-8 h-8 text-[var(--gray)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold text-[var(--blue)]">
                  {uploading ? 'Uploading to storage...' : 'Click to upload cover image'}
                </span>
                <span className="text-[11px] text-[var(--gray)] mt-0.5">PNG, JPG, WebP up to 5MB</span>
              </label>
            </div>

            {/* Direct URL Input */}
            <div className="space-y-1.5">
              <span className="text-xs text-[var(--gray)]">Or paste hosted image URL:</span>
              <input
                id="cover_image"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent"
                style={{
                  background: 'var(--paper)',
                  borderColor: 'var(--border)',
                  color: 'var(--fg)',
                }}
              />
            </div>
          </div>

          {/* Preview Container */}
          {formData.cover_image && (
            <div className="mt-3 relative w-full sm:w-80 aspect-[16/10] rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <img src={formData.cover_image} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="content">
              Content (Markdown) <span className="text-red-500">*</span>
            </label>
            <div 
              className="inline-flex items-center gap-1 p-1 rounded-xl border"
              style={{ background: 'var(--paper)', borderColor: 'var(--border)' }}
            >
              <button
                type="button"
                onClick={() => setContentTab('write')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  contentTab === 'write'
                    ? 'bg-[var(--blue)] text-white shadow-sm'
                    : 'text-[var(--gray)] hover:text-[var(--fg)]'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setContentTab('preview')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  contentTab === 'preview'
                    ? 'bg-[var(--blue)] text-white shadow-sm'
                    : 'text-[var(--gray)] hover:text-[var(--fg)]'
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setContentTab('split')}
                className={`hidden md:inline-flex px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  contentTab === 'split'
                    ? 'bg-[var(--blue)] text-white shadow-sm'
                    : 'text-[var(--gray)] hover:text-[var(--fg)]'
                }`}
              >
                Split View
              </button>
            </div>
          </div>

          {/* Write Tab */}
          {contentTab === 'write' && (
            <textarea
              id="content"
              rows={15}
              placeholder="Write your article content here in Markdown...&#10;&#10;## Section Heading&#10;Write detailed paragraphs with **bold text**, [links](https://...), and actionable insights.&#10;&#10;- Bullet point 1&#10;- Bullet point 2"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm font-mono border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent resize-y"
              style={{
                background: 'var(--paper)',
                borderColor: 'var(--border)',
                color: 'var(--fg)',
                minHeight: '340px',
              }}
            />
          )}

          {/* Preview Tab */}
          {contentTab === 'preview' && (
            <div
              className="w-full p-6 sm:p-8 rounded-xl border overflow-y-auto"
              style={{
                background: 'var(--paper)',
                borderColor: 'var(--border)',
                minHeight: '340px',
                maxHeight: '650px',
              }}
            >
              {formData.content.trim() ? (
                <BlogMarkdown content={formData.content} />
              ) : (
                <div className="py-16 text-center text-[var(--gray)]">
                  <p className="text-sm font-medium">Nothing to preview yet.</p>
                  <p className="text-xs mt-1">Switch to the Write tab and enter some Markdown content.</p>
                </div>
              )}
            </div>
          )}

          {/* Split Tab */}
          {contentTab === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                id="content-split"
                rows={15}
                placeholder="Write your article content here in Markdown..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm font-mono border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent resize-y"
                style={{
                  background: 'var(--paper)',
                  borderColor: 'var(--border)',
                  color: 'var(--fg)',
                  minHeight: '340px',
                }}
              />
              <div
                className="w-full p-6 rounded-xl border overflow-y-auto"
                style={{
                  background: 'var(--paper)',
                  borderColor: 'var(--border)',
                  minHeight: '340px',
                  maxHeight: '520px',
                }}
              >
                {formData.content.trim() ? (
                  <BlogMarkdown content={formData.content} />
                ) : (
                  <div className="py-16 text-center text-[var(--gray)]">
                    <p className="text-sm font-medium">Live preview will render here as you type.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-[var(--gray)] mt-1.5">
            Supports Markdown: ## for headings, - for bullets, ** for bold
          </p>
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
              <span>Update Article</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
