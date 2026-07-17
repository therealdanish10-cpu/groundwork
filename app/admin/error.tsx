'use client';

import { useEffect } from 'react';

/**
 * Next.js error boundary for the /admin segment.
 * Catches unhandled Server Component errors (e.g. failed Supabase queries,
 * network issues) and shows a clear message with a retry button.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin] Unhandled error:', error);
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
          We couldn&apos;t load the admin dashboard — this is usually a
          temporary network issue. Try again, and if it persists check the
          server logs.
        </p>

        <button className="btn btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
