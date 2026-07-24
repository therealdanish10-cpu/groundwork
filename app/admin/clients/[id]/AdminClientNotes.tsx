'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface NoteItem {
  id: string;
  note: string;
  created_at: string;
  created_by?: string;
}

interface Props {
  clientId: string;
  notes: NoteItem[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminClientNotes({ clientId, notes }: Props) {
  const router = useRouter();
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, note: noteText.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNoteText('');
        router.refresh();
      } else {
        setError(data.error || 'Failed to add client note.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Admin Notes</h2>
        <span style={{ color: 'var(--gray)', fontSize: '13px' }}>
          {notes.length} note{notes.length === 1 ? '' : 's'}
        </span>
      </div>

      <form onSubmit={handleAddNote} style={{ marginBottom: '24px' }}>
        {error && <div className="auth-error">{error}</div>}
        <div className="field">
          <label htmlFor="admin-new-note">Add internal note for this client</label>
          <textarea
            id="admin-new-note"
            rows={3}
            placeholder="e.g. Spoke on the phone regarding custom domain configuration…"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn plan-cta-btn btn-sm"
          disabled={submitting}
          style={{ marginTop: '12px', alignSelf: 'flex-start' }}
        >
          {submitting ? 'Adding note...' : 'Add Note'}
        </button>
      </form>

      {notes.length === 0 ? (
        <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
          No internal notes recorded for this client yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {notes.map(item => (
            <div
              key={item.id}
              style={{
                background: 'var(--paper-2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '16px 18px',
              }}
            >
              <p style={{ fontSize: '14px', color: 'var(--fg)', marginBottom: '8px', lineHeight: '1.6' }}>
                {item.note}
              </p>
              <span style={{ fontSize: '12px', color: 'var(--gray)' }}>
                {formatDate(item.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
