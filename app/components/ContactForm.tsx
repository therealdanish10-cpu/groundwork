'use client';

import { useState } from 'react';

interface FieldErrors {
  name?:  string;
  email?: string;
  trade?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [trade,     setTrade]     = useState('');
  const [message,   setMessage]   = useState('');
  const [errors,    setErrors]    = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!name.trim())            e.name  = 'Business name is required.';
    if (!email.trim())           e.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) e.email = 'Please enter a valid email address.';
    if (!trade.trim())           e.trade = 'Your trade is required.';
    return e;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    // Phase 2: wire up real form submission here (e.g. send to /api/contact or an email service).
    setSubmitted(true);
  }

  /* ── Success state ──────────────────────────────────────────── */
  if (submitted) {
    return (
      <div
        style={{
          background:   'rgba(198, 242, 78, 0.12)',
          border:       '1px solid rgba(198, 242, 78, 0.5)',
          borderRadius: '12px',
          padding:      '32px 24px',
          textAlign:    'center',
        }}
      >
        <div style={{ fontSize: '28px', marginBottom: '12px' }}>✓</div>
        <p style={{ fontWeight: 600, marginBottom: '6px' }}>Got it — we&apos;ll be in touch soon.</p>
        <p style={{ color: '#bdbdbd', fontSize: '14px' }}>
          We typically reply within one business day.
        </p>
      </div>
    );
  }

  /* ── Form ───────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Business name */}
      <div>
        <input
          type="text"
          placeholder="Business name"
          aria-label="Business name"
          aria-invalid={!!errors.name}
          value={name}
          onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: undefined })); }}
          style={errors.name ? { borderColor: '#dc2626' } : undefined}
        />
        {errors.name && (
          <p role="alert" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <input
          type="email"
          placeholder="Email"
          aria-label="Email address"
          aria-invalid={!!errors.email}
          value={email}
          onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
          style={errors.email ? { borderColor: '#dc2626' } : undefined}
        />
        {errors.email && (
          <p role="alert" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
            {errors.email}
          </p>
        )}
      </div>

      {/* Trade */}
      <div>
        <input
          type="text"
          placeholder="Trade (electrician, plumber, roofer…)"
          aria-label="Your trade"
          aria-invalid={!!errors.trade}
          value={trade}
          onChange={e => { setTrade(e.target.value); if (errors.trade) setErrors(p => ({ ...p, trade: undefined })); }}
          style={errors.trade ? { borderColor: '#dc2626' } : undefined}
        />
        {errors.trade && (
          <p role="alert" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
            {errors.trade}
          </p>
        )}
      </div>

      {/* Message (optional) */}
      <div>
        <textarea
          placeholder="Anything else we should know?"
          aria-label="Additional information"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </div>

      <button type="submit" className="btn">Send message</button>
    </form>
  );
}
