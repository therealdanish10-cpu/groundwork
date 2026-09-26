'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewGalleryProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    screenshot_url: '',
    live_link_url: '',
    category: 'Web'
  });

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        router.push('/admin/gallery');
        router.refresh();
      } else {
        alert('Error creating project');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">New Project</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--gray)]/5 p-6 rounded-2xl border border-[var(--border)]">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Project Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--blue)]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Category</label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--blue)] [&>option]:bg-[#111]"
          >
            <option value="Web">Web</option>
            <option value="Mobile">Mobile</option>
            <option value="AI">AI</option>
            <option value="Marketing">Marketing</option>
            <option value="WordPress">WordPress</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Screenshot (Upload File or Enter URL)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--blue)] file:text-white hover:file:opacity-90 cursor-pointer"
            />
          </div>
          {uploading && <p className="text-xs text-[var(--blue)]">Uploading image...</p>}
          <input
            type="text"
            placeholder="Or paste image URL"
            value={formData.screenshot_url}
            onChange={(e) => setFormData({ ...formData, screenshot_url: e.target.value })}
            className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--blue)]"
          />
          {formData.screenshot_url && (
            <div className="mt-2 relative w-40 h-28 rounded-lg overflow-hidden border border-[var(--border)]">
              <img src={formData.screenshot_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Live Link URL</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={formData.live_link_url}
            onChange={(e) => setFormData({ ...formData, live_link_url: e.target.value })}
            className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--blue)]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            disabled={loading || uploading}
            className="px-6 py-2 bg-[var(--blue)] text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
