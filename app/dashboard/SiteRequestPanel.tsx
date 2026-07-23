'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SiteRequest {
  id: string;
  message: string;
  status: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  open:        'Open',
  in_progress: 'In progress',
  done:        'Done',
};

function statusBadge(status: string): string {
  if (status === 'done')        return 'badge badge-live';
  if (status === 'in_progress') return 'badge badge-pending';
  return 'badge badge-pending'; // 'open'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  siteRequests: SiteRequest[];
  clientId:     string;
}

export default function SiteRequestPanel({ siteRequests, clientId }: Props) {
  const router = useRouter();

  const [showForm,   setShowForm]   = useState(false);
  const [message,    setMessage]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setFormError(null);

    const supabase = createClient();
    const { error } = await supabase.from('site_requests').insert({
      client_id: clientId,
      message:   message.trim(),
      status:    'open',
    });

    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    // Reset form and re-fetch server data so the new request appears.
    setMessage('');
    setShowForm(false);
    router.refresh();
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Site requests</h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setShowForm(v => !v); setFormError(null); }}
        >
          {showForm ? 'Cancel' : 'New request'}
        </button>
      </div>

      {/* ── New request form ─────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div className="field" style={{ marginBottom: '12px' }}>
            <label htmlFor="site-request-message">
              What do you need changed?
            </label>
            <textarea
              id="site-request-message"
              rows={3}
              placeholder="e.g. Update our opening hours, add a new service page for bathroom renovations…"
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{
                width:        '100%',
                resize:       'vertical',
                background:   'var(--white)',
                border:       '2px solid var(--input-border)',
                borderRadius: '8px',
                padding:      '11px 13px',
                color:        'var(--ink)',
                fontFamily:   'var(--font-inter), sans-serif',
                fontSize:     '14px',
                transition:   'var(--transition-theme)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--input-border)')}
            />
          </div>
          {formError && (
            <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>
              {formError}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      )}

      {/* ── Existing requests list ────────────────────────────── */}
      {siteRequests.length === 0 && !showForm ? (
        <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
          Need a change to your site — new photos, updated hours, a new service page?
          Hit <strong>New request</strong> above and we&apos;ll handle it.
        </p>
      ) : siteRequests.length > 0 ? (
        <div className="table-scroll-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Request</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {siteRequests.map(req => (
              <tr key={req.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(req.created_at)}</td>
                <td style={{ maxWidth: '340px' }}>
                  <span style={{ fontSize: '14px' }}>{req.message}</span>
                </td>
                <td>
                  <span className={statusBadge(req.status)}>
                    {STATUS_LABEL[req.status] ?? req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : null}
    </div>
  );
}
