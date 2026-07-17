'use client';

import { useEffect } from 'react';

/**
 * Next.js error boundary for the /dashboard segment.
 * Catches thrown errors (e.g. failed Supabase queries, network issues)
 * and shows a friendly message with a retry button instead of a blank page.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[dashboard] Unhandled error:', error);
  }, [error]);

  return (
    <div
      className="app-shell"
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '100vh',
        padding:        '80px 24px',
        textAlign:      'center',
      }}
    >
      <div style={{ maxWidth: '420px', width: '100%' }}>
        <div
          style={{
            display:       'inline-block',
            background:    'rgba(220, 38, 38, 0.08)',
            border:        '1px solid rgba(220, 38, 38, 0.25)',
            borderRadius:  '999px',
            color:         '#dc2626',
            fontSize:      '11px',
            fontWeight:    700,
            letterSpacing: '2px',
            padding:       '5px 16px',
            marginBottom:  '20px',
          }}
        >
          ERROR
        </div>

        <h2
          style={{
            fontFamily:   'var(--font-space-grotesk), sans-serif',
            fontSize:     '22px',
            marginBottom: '12px',
          }}
        >
          Something went wrong
        </h2>

        <p
          style={{
            color:        'var(--gray)',
            fontSize:     '14px',
            lineHeight:   1.6,
            marginBottom: '28px',
          }}
        >
          We couldn&apos;t load your dashboard — this is usually a temporary
          network issue. Try again, and if it keeps happening please contact
          support.
        </p>

        <button className="btn btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
