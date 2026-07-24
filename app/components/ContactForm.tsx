'use client';

import { useState } from 'react';

interface FieldErrors {
  name?: string;
  email?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [name, setPersonName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [trade, setTrade] = useState('Electrician');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = 'Your name is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) e.email = 'Please enter a valid email address.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          businessName: businessName.trim(),
          email: email.trim(),
          trade: trade.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setSubmitError(data.error || 'Failed to submit quote request. Please try again.');
      }
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Success state ──────────────────────────────────────────── */
  if (submitted) {
    return (
      <div
        style={{
          background:   'rgba(29, 78, 216, 0.08)',
          border:       '1px solid var(--blue)',
          borderRadius: '12px',
          padding:      '32px 24px',
          textAlign:    'center',
        }}
      >
        <div style={{ fontSize: '28px', color: 'var(--blue)', marginBottom: '12px' }}>✓</div>
        <p style={{ fontWeight: 600, marginBottom: '6px', fontSize: '16px' }}>
          Got it — we&apos;ll be in touch soon.
        </p>
        <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
          No obligation. We&apos;ll get back to you within one business day.
        </p>
      </div>
    );
  }

  /* ── Form ───────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {submitError && (
        <div role="alert" className="auth-error">
          {submitError}
        </div>
      )}

      <div className="form-grid">
        {/* Row 1, Col 1: Name */}
        <div className="field">
          <label htmlFor="form-name">Name</label>
          <input
            id="form-name"
            type="text"
            placeholder="Your name"
            aria-invalid={!!errors.name}
            value={name}
            onChange={e => {
              setPersonName(e.target.value);
              if (errors.name) setErrors(p => ({ ...p, name: undefined }));
            }}
            style={errors.name ? { borderColor: '#dc2626' } : undefined}
          />
          {errors.name && (
            <p role="alert" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Row 1, Col 2: Business name */}
        <div className="field">
          <label htmlFor="form-business">Business name</label>
          <input
            id="form-business"
            type="text"
            placeholder="Business name"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
          />
        </div>

        {/* Row 2, Col 1: Email */}
        <div className="field">
          <label htmlFor="form-email">Email</label>
          <input
            id="form-email"
            type="email"
            placeholder="you@business.com"
            aria-invalid={!!errors.email}
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (errors.email) setErrors(p => ({ ...p, email: undefined }));
            }}
            style={errors.email ? { borderColor: '#dc2626' } : undefined}
          />
          {errors.email && (
            <p role="alert" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Row 2, Col 2: Trade */}
        <div className="field">
          <label htmlFor="form-trade">Trade</label>
          <select
            id="form-trade"
            value={trade}
            onChange={e => setTrade(e.target.value)}
          >
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Roofer">Roofer</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Row 3, Full Width: Message */}
        <div className="field full-width">
          <label htmlFor="form-message">
            What&apos;s not working about your current site (if you have one)?
          </label>
          <textarea
            id="form-message"
            placeholder="Tell us a bit about what you need..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          style={{ width: '100%', padding: '14px 24px', borderRadius: '10px', fontSize: '15px' }}
        >
          {submitting ? 'Sending request...' : 'Request my free quote'}
        </button>
        <p style={{ fontSize: '12px', color: 'var(--gray)', textAlign: 'center' }}>
          No obligation. We&apos;ll get back to you within one business day.
        </p>
      </div>
    </form>
  );
}
