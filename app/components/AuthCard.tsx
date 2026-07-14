'use client';

import { useState } from 'react';

type Tab  = 'login'  | 'signup';
type Role = 'client' | 'admin';

export default function AuthCard() {
  const [activeTab,    setActiveTab]    = useState<Tab>('login');
  const [selectedRole, setSelectedRole] = useState<Role>('client');

  function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Phase 2: wire up real authentication here.
  }

  function handleSignupSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Phase 2: wire up real account creation here.
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
            onClick={() => setActiveTab('login')}
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
            onClick={() => setActiveTab('signup')}
          >
            Sign up
          </div>
        </div>

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
                />
              </div>

              <div className="forgot">
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="btn btn-primary">
                Log in
              </button>
            </form>

            <div className="fine-print">
              Don&rsquo;t have an account?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveTab('signup'); }}
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
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Create account
              </button>
            </form>

            <div className="fine-print">
              Already have an account?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}
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
