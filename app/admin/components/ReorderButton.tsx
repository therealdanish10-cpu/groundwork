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
      className="w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-bold transition-all disabled:opacity-40 cursor-pointer hover:border-[var(--blue)] hover:text-[var(--blue)]"
      style={{
        background: 'var(--paper)',
        borderColor: 'var(--border)',
        color: 'var(--fg)',
      }}
      title={`Move ${direction}`}
    >
      {loading ? (
        <span className="animate-spin text-[10px]">◌</span>
      ) : direction === 'up' ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  );
}
