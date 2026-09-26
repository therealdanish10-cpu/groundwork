'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ 
  type, 
  id, 
  itemTitle 
}: { 
  type: 'blog' | 'gallery'; 
  id: string; 
  itemTitle?: string; 
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const label = itemTitle ? `"${itemTitle}"` : `this ${type}`;
    if (!window.confirm(`Are you sure you want to permanently delete ${label}?`)) {
      return;
    }

    setLoading(true);
    const endpoint = type === 'blog' ? `/api/admin/blogs?id=${id}` : `/api/admin/gallery?id=${id}`;
    
    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete item. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while deleting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 border border-red-500/20 hover:border-red-500 transition-all cursor-pointer disabled:opacity-50"
      title={`Delete ${type}`}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span>{loading ? 'Deleting...' : 'Delete'}</span>
    </button>
  );
}
