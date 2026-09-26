'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ type, id }: { type: 'blog' | 'gallery', id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    setLoading(true);
    const endpoint = type === 'blog' ? `/api/admin/blogs?id=${id}` : `/api/admin/gallery?id=${id}`;
    
    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-600 disabled:opacity-50"
    >
      {loading ? '...' : 'Delete'}
    </button>
  );
}
