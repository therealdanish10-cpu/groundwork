'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          <Link href="/#contact" className="nav-cta">Get started</Link>
        </div>
      </div>
    </nav>
  );
}
