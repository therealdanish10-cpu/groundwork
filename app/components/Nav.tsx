'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const lastScrollY = useRef(0);
  const pauseTimer = useRef<NodeJS.Timeout | null>(null);
  const isHovered = useRef(false);

  // ── Scroll to true top (0,0) on initial load / reload ─────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  // ── Auto-hiding nav on scroll + pause behavior ───────────────────────────
  useEffect(() => {
    function onScroll() {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // At the true top (<= 50px), always keep nav visible
      if (currentScrollY <= 50) {
        setNavVisible(true);
        if (pauseTimer.current) {
          clearTimeout(pauseTimer.current);
          pauseTimer.current = null;
        }
        lastScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      // Scrolling DOWN -> hide nav immediately
      if (diff > 0) {
        if (pauseTimer.current) {
          clearTimeout(pauseTimer.current);
          pauseTimer.current = null;
        }
        if (!menuOpen) {
          setNavVisible(false);
        }
      } 
      // Scrolling UP even slightly -> make full nav appear/slide into view
      else if (diff < 0) {
        setNavVisible(true);
        if (pauseTimer.current) {
          clearTimeout(pauseTimer.current);
        }
        // Hides again after the user pauses scrolling (stops scrolling for a moment)
        pauseTimer.current = setTimeout(() => {
          if (window.scrollY > 50 && !isHovered.current && !menuOpen) {
            setNavVisible(false);
          }
        }, 1500);
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    };
  }, [menuOpen]);

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

  function isActive(href: string) {
    return pathname === href ? 'active' : undefined;
  }

  // ── Ensure clicking logo or Home always lands at true top (0,0) ───────────
  const handleLogoOrHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      requestAnimationFrame(() => window.scrollTo(0, 0));
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const navLinks = (
    <>
      <Link href="/" className={isActive('/')} onClick={handleLogoOrHomeClick}>Home</Link>
      <Link href="/services" className={isActive('/services')} onClick={() => setMenuOpen(false)}>Services</Link>
      <Link href="/work" className={isActive('/work')} onClick={() => setMenuOpen(false)}>Work</Link>
      <Link href="/blog" className={isActive('/blog')} onClick={() => setMenuOpen(false)}>Blog</Link>
      <Link href="/about" className={isActive('/about')} onClick={() => setMenuOpen(false)}>About</Link>
      <Link href="/contact" className={isActive('/contact')} onClick={() => setMenuOpen(false)}>Contact</Link>
    </>
  );

  return (
    <>
      <nav 
        id="nav" 
        className={`${scrolled ? 'scrolled' : ''} ${navVisible ? 'nav-visible' : 'nav-hidden'}`}
        onMouseEnter={() => {
          isHovered.current = true;
          if (pauseTimer.current) clearTimeout(pauseTimer.current);
        }}
        onMouseLeave={() => {
          isHovered.current = false;
          if (window.scrollY > 50 && !menuOpen) {
            if (pauseTimer.current) clearTimeout(pauseTimer.current);
            pauseTimer.current = setTimeout(() => {
              if (window.scrollY > 50 && !isHovered.current && !menuOpen) {
                setNavVisible(false);
              }
            }, 1500);
          }
        }}
      >
        <div className="nav-inner">
          <Link href="/" className="logo" aria-label="Trelio home" onClick={handleLogoOrHomeClick}>
            {/* Light-mode logo */}
            <Image
              src="/trelio-logo-nav.png"
              alt="Trelio"
              className="nav-logo-img nav-logo-light"
              width={495}
              height={120}
              priority
            />
            {/* Dark-mode logo — shown via [data-theme="dark"] CSS */}
            <Image
              src="/trelio-logo-nav-dark.png"
              alt=""
              aria-hidden="true"
              className="nav-logo-img nav-logo-dark"
              width={495}
              height={120}
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links">
            {navLinks}
          </div>

          {/* Right-side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {hasSession ? (
              <Link href="/admin" className="nav-cta">
                Admin
              </Link>
            ) : (
              <Link href="/contact" className="nav-cta">Get in Touch</Link>
            )}

            <ThemeToggle />

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
              <Link href="/admin" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            ) : (
              <Link href="/contact" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                Get in Touch
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
