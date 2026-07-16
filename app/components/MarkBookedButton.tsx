'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  leadId: string;
}

/**
 * Shared "Mark as booked" button used in both the client dashboard
 * (LeadsTable) and the admin leads-to-log queue (PendingLeadsPanel).
 *
 * On click: POSTs to /api/leads/[id]/book which:
 *   1. Verifies the lead is still pending (idempotency guard)
 *   2. Confirms an active Grow subscription exists for the client
 *   3. Creates a $50 off-session Stripe PaymentIntent
 *   4. On success — marks the lead booked + charged in Supabase
 *   5. On failure — marks charge_status = 'failed', surfaces the reason here
 */
export default function MarkBookedButton({ leadId }: Props) {
  const router = useRouter();
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/leads/${leadId}/book`, { method: 'POST' });
      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong — please try again.');
        return;
      }

      /* Success — refresh so the parent Server Component re-fetches */
      router.refresh();
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
      <button
        className="btn btn-ghost btn-sm"
        disabled={busy}
        onClick={handleClick}
        style={{ opacity: busy ? 0.7 : 1, cursor: busy ? 'wait' : 'pointer' }}
      >
        {busy ? 'Charging…' : 'Mark booked'}
      </button>
      {error && (
        <span
          role="alert"
          style={{
            color:     '#dc2626',
            fontSize:  '11px',
            maxWidth:  '220px',
            lineHeight: '1.3',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
