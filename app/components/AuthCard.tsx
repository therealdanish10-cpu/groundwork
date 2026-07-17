'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Tab  = 'login'  | 'signup';

/**
 * Maps raw Supabase auth error strings to friendlier, user-facing messages.
 * Keeps error phrasing consistent and avoids leaking internal details.
 */
function friendlyAuthError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('invalid login credentials') ||
      m.includes('invalid email or password') ||
      m.includes('email not confirmed')) {
    return 'Invalid email or password — please check your details and try again.';
  }
  if (m.includes('user already registered') ||
      m.includes('already been registered') ||
      m.includes('already exists')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (m.includes('password should be') ||
      m.includes('password must be') ||
      m.includes('too short')) {
    return 'Password must be at least 6 characters.';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Too many attempts — please wait a moment and try again.';
  }
  if (m.includes('email') && (m.includes('invalid') || m.includes('format'))) {
    return 'Please enter a valid email address.';
  }
  return raw; // unknown error — show as-is
}
type Role = 'client' | 'admin';

export default function AuthCard() {
  const router = useRouter();

  /* ── Tab / role state ──────────────────────────────────── */
  const [activeTab,    setActiveTab]    = useState<Tab>('login');
  const [selectedRole, setSelectedRole] = useState<Role>('client');

  /* ── Shared loading / error state ─────────────────────── */
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  /* ── Login form state ──────────────────────────────────── */
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  /* ── Sign-up form state ────────────────────────────────── */
  const [signupBusiness, setSignupBusiness] = useState('');
  const [signupTrade,    setSignupTrade]    = useState('');
  const [signupEmail,    setSignupEmail]    = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  /* ── Switch tabs and clear state ──────────────────────── */
  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setError(null);
  }

  /* ── Login handler ─────────────────────────────────────── */
  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email:    loginEmail,
      password: loginPassword,
    });

    if (authError || !data.user) {
      setError(friendlyAuthError(authError?.message ?? 'Login failed — please try again.'));
      setLoading(false);
      return;
    }

    // Look up the user's role from their profiles row so we can redirect correctly.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      // Fallback: default to /dashboard if the profile row isn't readable yet.
      router.push('/dashboard');
      return;
    }

    router.push(profile.role === 'admin' ? '/admin' : '/dashboard');
  }

  /* ── Sign-up handler ───────────────────────────────────── */
  async function handleSignupSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email:    signupEmail,
      password: signupPassword,
      options: {
        // These fields are picked up by the handle_new_user trigger to
        // auto-create the corresponding row in the profiles table.
        data: {
          role:          selectedRole,
          business_name: signupBusiness,
          trade:         signupTrade,
        },
      },
    });

    setLoading(false);

    if (authError) {
      setError(friendlyAuthError(authError.message));
      return;
    }

    // Redirect immediately based on the role chosen in the form.
    // (The profile row is created asynchronously by the DB trigger.)
    router.push(selectedRole === 'admin' ? '/admin' : '/dashboard');
  }

  return (
    <div className="wrap">
      <div className="auth-card">
        {/* ── Tab strip ──────────────────────────────────── */}
        <div className="tabs" role="tablist">
          <div
            id="tab-login"
            className={`tab${activeTab === 'login' ? ' active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'login'}
            aria-controls="panel-login"
            tabIndex={activeTab === 'login' ? 0 : -1}
            onClick={() => switchTab('login')}
          >
            Log in
          </div>
          <div
            id="tab-signup"
            className={`tab${activeTab === 'signup' ? ' active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'signup'}
            aria-controls="panel-signup"
            tabIndex={activeTab === 'signup' ? 0 : -1}
            onClick={() => switchTab('signup')}
          >
            Sign up
          </div>
        </div>

        {/* ── Inline error banner ─────────────────────────── */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {/* ── Log in panel ───────────────────────────────── */}
        {activeTab === 'login' && (
          <div id="panel-login" role="tabpanel" aria-labelledby="tab-login">
            <h1 className="title">Welcome back</h1>
            <p className="subtitle">Log in to your Groundwork dashboard.</p>

            <form onSubmit={handleLoginSubmit}>
              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  placeholder="you@business.com"
                  required
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <div className="forgot">
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Log in'}
              </button>
            </form>

            <div className="fine-print">
              Don&rsquo;t have an account?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); switchTab('signup'); }}
              >
                Sign up
              </a>
            </div>
          </div>
        )}

        {/* ── Sign up panel ──────────────────────────────── */}
        {activeTab === 'signup' && (
          <div id="panel-signup" role="tabpanel" aria-labelledby="tab-signup">
            <h1 className="title">Create your account</h1>
            <p className="subtitle">Set up access to your Groundwork dashboard.</p>

            <form onSubmit={handleSignupSubmit}>
              {/* Role selector */}
              <div className="field">
                <label>I am a</label>
                <div className="role-toggle" role="group" aria-label="Account type">
                  <div
                    id="role-client"
                    className={`role-option${selectedRole === 'client' ? ' selected' : ''}`}
                    role="radio"
                    aria-checked={selectedRole === 'client'}
                    tabIndex={selectedRole === 'client' ? 0 : -1}
                    onClick={() => setSelectedRole('client')}
                  >
                    Business owner
                  </div>
                  <div
                    id="role-admin"
                    className={`role-option${selectedRole === 'admin' ? ' selected' : ''}`}
                    role="radio"
                    aria-checked={selectedRole === 'admin'}
                    tabIndex={selectedRole === 'admin' ? 0 : -1}
                    onClick={() => setSelectedRole('admin')}
                  >
                    Groundwork admin
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="signup-business">Business name</label>
                <input
                  type="text"
                  id="signup-business"
                  placeholder="Rowe Electrical Services"
                  required
                  autoComplete="organization"
                  value={signupBusiness}
                  onChange={(e) => setSignupBusiness(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="signup-trade">Trade / industry</label>
                <input
                  type="text"
                  id="signup-trade"
                  placeholder="e.g. Electrician, Plumber, Roofer"
                  required
                  value={signupTrade}
                  onChange={(e) => setSignupTrade(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="signup-email">Email</label>
                <input
                  type="email"
                  id="signup-email"
                  placeholder="you@business.com"
                  required
                  autoComplete="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="signup-password">Password</label>
                <input
                  type="password"
                  id="signup-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <div className="fine-print">
              Already have an account?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); switchTab('login'); }}
              >
                Log in
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
