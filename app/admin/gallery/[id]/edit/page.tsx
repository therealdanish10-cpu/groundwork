'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import React from 'react';

export default function EditGalleryProjectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    screenshot_url: '',
    live_link_url: '',
    category: 'Web'
  });

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('gallery').select('*').eq('id', id).single();
      if (data && !error) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          screenshot_url: data.screenshot || data.screenshot_url || '',
          live_link_url: data.live_link || data.live_link_url || '',
          category: data.category || 'Web'
        });
      }
      setFetching(false);
    };
    fetchProject();
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `screenshots/${fileName}`;

      const { data, error } = await supabase.storage.from('gallery').upload(filePath, file);
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
        setFormData(prev => ({ ...prev, screenshot_url: publicUrl }));
        setUploading(false);
        return;
      }
    } catch (err) {
      console.warn('Supabase storage upload fell back:', err);
    }

    // Fallback: Read as base64 data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, screenshot_url: reader.result as string }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...formData })
      });

      if (res.ok) {
        router.push('/admin/gallery');
      } else {
        const err = await res.json();
        alert(err.error || 'Error updating project');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Error updating project');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--blue)]/30 border-t-[var(--blue)] rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[var(--gray)]">Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link 
          href="/admin/gallery"
          prefetch={true}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--gray)] hover:text-[var(--blue)] transition-colors mb-3"
        >
          <span>←</span> Back to Gallery
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--fg)] tracking-tight">
              Edit Project
            </h1>
            <p className="text-sm text-[var(--gray)] mt-1">
              Update case study information, media, and destination link.
            </p>
          </div>

          {formData.live_link_url && (
            <a
              href={formData.live_link_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--blue)] hover:underline self-start sm:self-auto"
            >
              <span>Visit live link</span>
              <span>↗</span>
            </a>
          )}
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
        {/* Name and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="name">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent"
              style={{
                background: 'var(--paper)',
                borderColor: 'var(--border)',
                color: 'var(--fg)',
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="category">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent cursor-pointer"
              style={{
                background: 'var(--paper)',
                borderColor: 'var(--border)',
                color: 'var(--fg)',
              }}
            >
              <option value="Web Development">Web Development</option>
              <option value="SEO">SEO</option>
              <option value="App Development">App Development</option>
              <option value="Social Media Management">Social Media Management</option>
              <option value="AI Automation">AI Automation</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="Content Writing">Content Writing</option>
              <option value="WordPress Development">WordPress Development</option>
            </select>
          </div>
        </div>

        {/* Screenshot Upload / URL */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[var(--fg)]">
              Project Screenshot
            </label>
            {formData.screenshot_url && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, screenshot_url: '' }))}
                className="text-xs text-red-500 hover:underline"
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
                id="file-upload-edit"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload-edit" className="cursor-pointer flex flex-col items-center">
                <svg className="w-8 h-8 text-[var(--gray)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold text-[var(--blue)]">
                  {uploading ? 'Uploading to storage...' : 'Click to replace screenshot'}
                </span>
                <span className="text-[11px] text-[var(--gray)] mt-0.5">PNG, JPG, WebP up to 5MB</span>
              </label>
            </div>

            {/* Direct URL Input */}
            <div className="space-y-1.5">
              <span className="text-xs text-[var(--gray)]">Or paste hosted image URL:</span>
              <input
                type="url"
                placeholder="https://..."
                value={formData.screenshot_url}
                onChange={(e) => setFormData({ ...formData, screenshot_url: e.target.value })}
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
          {formData.screenshot_url && (
            <div className="mt-3 relative w-full sm:w-80 aspect-[16/10] rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <img src={formData.screenshot_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Live Link URL */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="live_link">
            Live Website or App URL
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-xs text-[var(--gray)] select-none">
              🌐
            </span>
            <input
              id="live_link"
              type="url"
              placeholder="https://client-product.com"
              value={formData.live_link_url}
              onChange={(e) => setFormData({ ...formData, live_link_url: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent"
              style={{
                background: 'var(--paper)',
                borderColor: 'var(--border)',
                color: 'var(--fg)',
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[var(--fg)]" htmlFor="description">
            Project Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent resize-y"
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
            disabled={loading || uploading}
            className="btn btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Update Project</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
