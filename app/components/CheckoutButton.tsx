'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Plan = 'build' | 'host' | 'grow';

interface Props {
  plan:      Plan;
  className: string;
  children:  React.ReactNode;
}

/**
 * Wraps a pricing plan CTA button with real Stripe Checkout logic.
 *
 * Flow:
 *  1. Check if the user is logged in (browser Supabase client).
 *  2. If not → redirect to /login.
 *  3. If yes → POST /api/checkout with the plan, get back a URL,
 *     redirect the browser to Stripe Checkout.
 */
export default function CheckoutButton({ plan, className, children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);

    /* ── 1. Check auth client-side first ──────────────────────── */
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      setLoading(false);
      return;
    }

    /* ── 2. Create Checkout Session ───────────────────────────── */
    try {
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        router.push('/login');
        setLoading(false);
        return;
      }

      /* 409 — user already has this plan active */
      if (res.status === 409) {
        const data = await res.json() as { message?: string };
        setError(
          data.message ??
          'You already have this plan active. Visit your dashboard to manage billing.'
        );
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Failed to create checkout session');
      }

      const { url } = await res.json() as { url: string };

      /* ── 3. Redirect to Stripe Checkout ───────────────────── */
      window.location.href = url;
      // Keep loading=true — page will navigate away
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className={className}
        disabled={loading}
        onClick={handleClick}
        style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
      >
        {loading ? 'Redirecting…' : children}
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
