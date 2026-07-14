'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { createClient } from '@/lib/supabase/client';

export default function Nav() {
  const [scrolled,    setScrolled]    = useState(false);
  const [hasSession,  setHasSession]  = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  // ── Scroll handler ──────────────────────────────────────────────────────
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Session state ───────────────────────────────────────────────────────
  // Check once on mount, then keep in sync via onAuthStateChange so the
  // button swaps immediately after login/logout without a full page reload.
  useEffect(() => {
    const supabase = createClient();

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasSession(!!user);
    });

    // Subscribe to future auth events (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setHasSession(!!session?.user);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Log out ─────────────────────────────────────────────────────────────
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  function isActive(href: string) {
    return pathname === href ? 'active' : undefined;
  }

  return (
    <nav id="nav" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-inner">
        {/* Logo — clickable link back to home */}
        <Link href="/" className="logo" aria-label="Groundwork Technologies home" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span>GROUND<span className="work">WORK</span></span>
          <span style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--gray)', fontWeight: 500, marginTop: '3px' }}>TECHNOLOGIES</span>
        </Link>

        {/* Primary nav links */}
        <div className="nav-links">
          <Link href="/#how"      className={isActive('/#how')}>How it works</Link>
          <Link href="/pricing"   className={isActive('/pricing')}>Pricing</Link>
          <Link href="/#faq"      className={isActive('/#faq')}>FAQ</Link>
          <Link href="/#contact"  className={isActive('/#contact')}>Contact</Link>
        </div>

        {/* Right-side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ThemeToggle />

          {hasSession ? (
            /* Logged-in: show Log out button */
            <button
              id="nav-logout"
              className="nav-cta nav-logout"
              onClick={handleLogout}
            >
              Log out
            </button>
          ) : (
            /* Logged-out: show Get started CTA */
            <Link href="/#contact" className="nav-cta">Get started</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
