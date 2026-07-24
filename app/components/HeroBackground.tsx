'use client';

import { useEffect, useRef } from 'react';

export default function HeroBackground() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      if (fieldRef.current) {
        const scrolled = window.scrollY;
        // Subtle parallax movement at 20% scroll speed
        fieldRef.current.style.transform = `translate3d(0, ${scrolled * 0.2}px, 0)`;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="blob-field" ref={fieldRef} aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="grain" />
    </div>
  );
}
