import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Payment Successful — Trelio',
  description: 'Your payment was successful. Check your email to set up your account.',
};

export default function CheckoutSuccessPage() {
  return (
    <div className="wrap">
      <div
        className="auth-card"
        style={{
          textAlign: 'center',
          maxWidth: '520px',
          padding: '48px 36px',
        }}
      >
        {/* Blue Accent Check Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(29, 78, 216, 0.1)',
            border: '1px solid var(--blue)',
            color: 'var(--blue)',
            fontSize: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontWeight: '700',
          }}
        >
          ✓
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--fg)' }}>
          Payment successful!
        </h1>

        <p style={{ color: 'var(--gray)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
          Thank you for choosing Trelio. We&apos;ve sent a password setup link to your email address. Please check your inbox to complete your account setup and access your client dashboard.
        </p>

        <div
          style={{
            background: 'var(--paper-2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontSize: '14px',
            color: 'var(--gray)',
            marginBottom: '28px',
            textAlign: 'left',
          }}
        >
          <strong style={{ color: 'var(--fg)', display: 'block', marginBottom: '4px' }}>What happens next?</strong>
          1. Open your email inbox for the activation link.<br />
          2. Set your secure password.<br />
          3. Log in to your Trelio client dashboard.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <Link href="/login" className="btn plan-cta-btn" style={{ width: '100%' }}>
            Go to Login
          </Link>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--gray)' }}>
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
