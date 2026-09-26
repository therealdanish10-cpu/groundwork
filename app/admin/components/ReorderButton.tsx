'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReorderButton({ 
  id, 
  direction, 
  currentOrder 
}: { 
  id: string; 
  direction: 'up' | 'down'; 
  currentOrder: number;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReorder = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gallery/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, direction, currentOrder })
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReorder}
      disabled={loading}
      className="p-1 text-[var(--fg)]/50 hover:text-[var(--fg)] disabled:opacity-50"
      title={`Move ${direction}`}
    >
      {direction === 'up' ? '↑' : '↓'}
    </button>
  );
}
