'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  userId: string;
  initialPlanType: string;
  initialStatus: string;
}

export default function AdminSubscriptionForm({
  userId,
  initialPlanType,
  initialStatus,
}: Props) {
  const router = useRouter();
  const [planType, setPlanType] = useState(initialPlanType || 'build');
  const [status, setStatus] = useState(initialStatus || 'active');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planType, status }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(data.error || 'Failed to update subscription.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && <div className="auth-error">{error}</div>}
      {success && (
        <div style={{ color: 'var(--blue)', fontSize: '13px', fontWeight: 600 }}>
          ✓ Subscription record updated in local database.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="field">
          <label htmlFor="admin-plan-select">Plan Type</label>
          <select
            id="admin-plan-select"
            value={planType}
            onChange={e => setPlanType(e.target.value)}
          >
            <option value="build">Build ($500)</option>
            <option value="host">Host ($700 + $50/mo)</option>
            <option value="grow">Grow ($1,000 + $70/mo + $50/job)</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="admin-status-select">Subscription Status</label>
          <select
            id="admin-status-select"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
            <option value="past_due">Past due</option>
          </select>
        </div>
      </div>

      <p style={{ color: 'var(--gray)', fontSize: '12px', lineHeight: '1.5' }}>
        ⚠️ <strong>Note:</strong> Manual overrides update database records only and do not alter actual Stripe billing subscriptions.
      </p>

      <button
        type="submit"
        className="btn plan-cta-btn btn-sm"
        disabled={submitting}
        style={{ alignSelf: 'flex-start' }}
      >
        {submitting ? 'Saving changes...' : 'Save subscription changes'}
      </button>
    </form>
  );
}
