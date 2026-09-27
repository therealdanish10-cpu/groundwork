'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Invalid login credentials. Please try again.');
        setLoading(false);
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div 
        className="w-full max-w-md rounded-2xl border p-8 sm:p-10 transition-all duration-300"
        style={{
          background: 'var(--paper-2)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center mb-4 transition-transform hover:scale-[1.02] focus:outline-none" 
            aria-label="Trelio home"
          >
            <img
              src="/trelio-logo-nav.png"
              alt="Trelio"
              className="nav-logo-img nav-logo-light"
              style={{ height: '36px', width: 'auto' }}
            />
            <img
              src="/trelio-logo-nav-dark.png"
              alt="Trelio"
              className="nav-logo-img nav-logo-dark"
              style={{ height: '36px', width: 'auto' }}
            />
          </Link>

          <span className="text-xs font-bold uppercase tracking-wider text-[var(--blue)] mb-2">
            Admin Portal
          </span>
          <h1 className="text-2xl font-extrabold text-[var(--fg)] tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--gray)] mt-1.5 max-w-xs">
            Sign in to manage your services, articles, and client project gallery.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div 
            className="mb-6 p-4 rounded-xl text-sm font-medium flex items-start gap-3 border"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              borderColor: 'rgba(239, 68, 68, 0.25)',
              color: '#dc2626',
            }}
            role="alert"
          >
            <svg 
              className="w-5 h-5 flex-shrink-0 mt-0.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <label 
              htmlFor="email" 
              className="block text-sm font-semibold text-[var(--fg)]"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm text-[var(--fg)] border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent placeholder:text-[var(--gray)]/60"
              style={{
                background: 'var(--paper)',
                borderColor: 'var(--border)',
              }}
              placeholder="admin@trelio.tech"
            />
          </div>

          <div className="space-y-1.5">
            <label 
              htmlFor="password" 
              className="block text-sm font-semibold text-[var(--fg)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm text-[var(--fg)] border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent placeholder:text-[var(--gray)]/60"
              style={{
                background: 'var(--paper)',
                borderColor: 'var(--border)',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3.5 mt-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                  />
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Return to site */}
        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
          <Link 
            href="/" 
            className="text-xs font-medium text-[var(--gray)] hover:text-[var(--blue)] transition-colors inline-flex items-center gap-1.5"
          >
            <span>←</span> Back to trelio.tech
          </Link>
        </div>
      </div>
    </div>
  );
}
