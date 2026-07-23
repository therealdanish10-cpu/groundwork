'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { createClient } from '@/lib/supabase/client';

export default function Nav() {
  const [scrolled,    setScrolled]    = useState(false);
  const [hasSession,  setHasSession]  = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
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

  // ── Close mobile menu on route change ───────────────────────────────────
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // ── Prevent body scroll while mobile menu is open ───────────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // ── Session state ───────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasSession(!!user);
    });

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
    setMenuOpen(false);
    router.push('/');
  }

  function isActive(href: string) {
    return pathname === href ? 'active' : undefined;
  }

  const navLinks = (
    <>
      <Link href="/#how"     className={isActive('/#how')}     onClick={() => setMenuOpen(false)}>How it works</Link>
      <Link href="/pricing"  className={isActive('/pricing')}  onClick={() => setMenuOpen(false)}>Pricing</Link>
      <Link href="/#faq"     className={isActive('/#faq')}     onClick={() => setMenuOpen(false)}>FAQ</Link>
      <Link href="/about"    className={isActive('/about')}    onClick={() => setMenuOpen(false)}>About</Link>
      <Link href="/#contact" className={isActive('/#contact')} onClick={() => setMenuOpen(false)}>Contact</Link>
    </>
  );

  return (
    <>
      <nav id="nav" className={scrolled ? 'scrolled' : ''}>
        <div className="nav-inner">
          <Link href="/" className="logo" aria-label="Trelio home">
            <span className="logo-text">Trelio</span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links">
            {navLinks}
          </div>

          {/* Right-side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ThemeToggle />

            {hasSession ? (
              <button
                id="nav-logout"
                className="nav-cta nav-logout"
                onClick={handleLogout}
              >
                Log out
              </button>
            ) : (
              <Link href="/#contact" className="nav-cta">Get started</Link>
            )}

            {/* Hamburger — visible only on mobile (≤900px via CSS) */}
            <button
              className="nav-hamburger"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
            >
              <span className={`ham-bar${menuOpen ? ' open' : ''}`} />
              <span className={`ham-bar${menuOpen ? ' open' : ''}`} />
              <span className={`ham-bar${menuOpen ? ' open' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="nav-mobile-menu"
          role="dialog"
          aria-label="Navigation menu"
        >
          <div className="nav-mobile-links">
            {navLinks}
            <div className="nav-mobile-divider" />
            {hasSession ? (
              <button className="nav-mobile-logout" onClick={handleLogout}>
                Log out
              </button>
            ) : (
              <Link href="/#contact" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                Get started
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
