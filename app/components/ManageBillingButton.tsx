'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  /** Whether the user has an active subscription with a Stripe customer ID.
   *  When false, the button is disabled and shows a tooltip. */
  hasStripeCustomer: boolean;
  className?: string;
}

/**
 * Calls POST /api/billing-portal, gets back a Stripe-hosted portal URL,
 * then redirects the browser there.
 *
 * If the user has no Stripe customer (e.g. Build plan one-time payment with no
 * customer ID saved, or no active subscription), the button is disabled.
 */
export default function ManageBillingButton({ hasStripeCustomer, className }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleClick() {
    if (!hasStripeCustomer) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' });

      if (res.status === 401) {
        router.push('/login');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Failed to open billing portal');
      }

      const { url } = await res.json() as { url: string };

      /* Redirect to Stripe's hosted portal — keep loading=true */
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  const isDisabled = !hasStripeCustomer || loading;

  return (
    <>
      <button
        className={className}
        disabled={isDisabled}
        onClick={handleClick}
        title={
          !hasStripeCustomer
            ? 'Billing portal is only available for subscription plans'
            : undefined
        }
        style={{
          display:   'block',
          textAlign: 'center',
          marginTop: '14px',
          opacity:   isDisabled ? 0.45 : 1,
          cursor:    isDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Opening portal…' : 'Manage billing'}
      </button>
      {error && (
        <p
          role="alert"
          style={{ color: '#dc2626', fontSize: '12px', marginTop: '6px', textAlign: 'center' }}
        >
          {error}
        </p>
      )}
    </>
  );
}
