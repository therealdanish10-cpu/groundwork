import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page not found',
};

/**
 * Branded 404 page — shown for any URL that doesn't match a route.
 * Uses the app's existing design tokens so it looks consistent.
 */
export default function NotFound() {
  return (
    <div
      className="app-shell"
      style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        minHeight:       '100vh',
        padding:         '80px 24px 60px',
        textAlign:       'center',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div
          className="section-eyebrow"
          style={{ justifyContent: 'center', marginBottom: '20px', fontSize: '11px', letterSpacing: '4px' }}
        >
          404
        </div>

        <h1
          style={{
            fontFamily:  'var(--font-space-grotesk), sans-serif',
            fontSize:    'clamp(30px, 6vw, 52px)',
            fontWeight:  700,
            lineHeight:  1.1,
            marginBottom: '16px',
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            color:        'var(--gray)',
            fontSize:     '16px',
            lineHeight:   1.6,
            marginBottom: '36px',
          }}
        >
          This page doesn&apos;t exist or may have moved. Check the URL, or
          head back to where you started.
        </p>

        <div
          style={{
            display:        'flex',
            gap:            '12px',
            justifyContent: 'center',
            flexWrap:       'wrap',
          }}
        >
          <Link href="/" className="btn btn-primary">Back to home</Link>
          <Link href="/pricing" className="btn btn-ghost">View pricing</Link>
        </div>
      </div>
    </div>
  );
}
